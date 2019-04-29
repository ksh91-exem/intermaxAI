Ext.define('config.config_trainning_manual_form', {
    parent: null,
    wasid: '',
    wasname: '',
    hostname: '',
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
        wasId: '',
        wasName: '',
        hostName: '',
        tierId: ''
    },

    DisplayTime: DisplayTimeMode.None,

    init: function (state) {
        var self = this;

        this.mode = state;

        self.referenceObjArray = [];

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
                    if ( self.isWasNameModifiedAll ) {
                        self.parent.onButtonClick('Refresh');
                    }
                }
            }
        });

        form.setTitle(common.Util.TR('수동학습 설정'));

        var panelA = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            width: '100%',
            flex: 1,
            margin: '4 4 4 4',
            border: false
        });

        var optionArea = Ext.create('Ext.panel.Panel', {
            width   : '100%',
            height  : '40px',
            layout  : 'hbox',
            cls: 'x-config-used-round-panel',
            bodyStyle: { background: '#eeeeee' },
            margin : '0 0 5 0'
        });

        var dateLabel = Ext.create('Ext.form.Label', {
            margin     : '13 0 0 10',
            text : common.Util.TR('Learning Data Range')
        });

        this.datePicker = Ext.create('Exem.DatePicker', {
            margin     : '10 0 0 5',
            height     : 30,
            DisplayTime: this.DisplayTime,
            rangeOneDay: this.rangeOneDay,
            singleField: this.singleField,
            isDiff     : this.isDiff,
            defaultTimeGap : this.defaultTimeGap,
            useRetriveBtn : false,
            useGoDayButton : false
        });

        optionArea.add(dateLabel, this.datePicker);

        this.grid = Ext.create('Exem.adminGrid', {
            width : '100%',
            flex : 1,
            editMode: true,
            useCheckBox: false,
            checkMode: Grid.checkMode.MULTI,
            showHeaderCheckbox: false,
            rowNumber: true,
            localeType: 'H:i:s',
            stripeRows: true,
            defaultHeaderHeight: 26,
            usePager: false,
            defaultbufferSize: 300,
            defaultPageSize: 300
        });

        this.grid.beginAddColumns();
        this.grid.addColumn({text: common.Util.CTR('Agent Name') ,   dataIndex: 'was_name',    width: 120, type: Grid.String      , alowEdit: false, editMode: false});
        this.grid.addColumn({text: common.Util.CTR('Description'),   dataIndex: 'was_id'  ,    width: 120, type: Grid.StringNumber, alowEdit: false, editMode: false});
        this.grid.endAddColumns();

        panelA.add([optionArea, this.grid]);

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
            text: common.Util.TR('학습'),
            cls: 'x-btn-config-default',
            width: 70,
            margin: '0 2 0 0',
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
                    this.up('.window').close();
                }
            }
        });

        panelC.add(OKButton);
        panelC.add(this.CancelButton);

        form.add(panelA);
        form.add(panelC);

        form.show();

        this.grid.drawGrid();
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

    wasClick: function(index, recordData) {
        this.tierComboBox.store.loadData(this.tierComboBox.data);
        var self = this;
        var wasGrid = self.was_grid;
        var parentGrid = self.parent.wasGrid;
        var beforeObjOne = self.beforeObj;
        var isModified = self.isWasNameModified;

        // *tip)  beforeObjOne 와 pre*** 와 비교

        // 선택 포인트가 넘어가기 전에 값들을 미리 담아둔다.
        var preWasIdEdit        = self.wasIdEdit;
        var preWasNameEdit      = self.wasNameEdit;
        var preHostNameEdit     = self.hostNameEdit;
        var preTierId           = self.tierComboBox;
        var preWasIdEditValue   = self.wasIdEdit.getValue();
        var preWasNameEditValue = self.wasNameEdit.getValue();
        var preHostNameEditValue = self.hostNameEdit.getValue();
        var preTierIdValue       = this.tierComboBox.getValue();
        if(typeof preTierIdValue === 'number' ){
            if(!this.tierComboBox.ajaxGetNameDataByValue(preTierIdValue)){
                preTierIdValue = null;
            }
        }

        // 선택된 포인트의 값들을 저장한다.
        var rdWasId = recordData.was_id;
        var rdWasName = recordData.was_name;
        var rdHostName = recordData.host_name;
        var rdTierId = recordData.tier_id;

        if ( beforeObjOne.wasId == '' ) {
            beforeObjOne.wasId      = preWasIdEditValue;
            beforeObjOne.wasName    = preWasNameEditValue;
            beforeObjOne.hostName   = preHostNameEditValue;
            beforeObjOne.tierId     = preTierIdValue;
        }

        if ( beforeObjOne.wasId == preWasIdEditValue ) {
            if ( beforeObjOne.wasName != preWasNameEditValue ) {
                for (var ix = 0; ix < parentGrid.getRowCount(); ix++) {
                    if (parentGrid.getRow(ix).data.was_name == preWasNameEditValue) {
                        //월래 가지고 있던 값, 에이전트명이 없을 경우 제외
                        if(preWasNameEditValue === '' || parentGrid.getRow(ix).data.was_id === preWasIdEditValue){
                            continue;
                        }
                        Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Agent name is already registered.'));
                        var record = wasGrid.findRow('was_id', preWasIdEditValue);
                        if (record) {
                            record.set('was_name', beforeObjOne.wasName);
                        }
                        return false;
                    }
                }

                wasGrid.updateCell('was_name', beforeObjOne.preIndex, preWasNameEditValue);
                isModified = true;
            }

            if ( beforeObjOne.hostName != preHostNameEditValue ) {
                wasGrid.updateCell('host_name', beforeObjOne.preIndex, preHostNameEditValue);
                isModified = true;
            }

            if ( beforeObjOne.tierId != preTierIdValue ) {
                wasGrid.updateCell('tier_id', beforeObjOne.preIndex, preTierIdValue);
                isModified = true;
            }

            //referenceObjArray 값을 계속 쌓는것이 아닌 에이전트 ID당 1번만 쌓도록 수정.
            for( ix = 0; ix < self.referenceObjArray.length; ix++){
                if(isModified && self.referenceObjArray[ix].wasId === preWasIdEditValue){
                        self.removeRefArray(ix);
                }
            }

            if ( isModified ) {
                self.addRefArray(preWasIdEditValue, preWasNameEditValue, preHostNameEditValue, preTierIdValue);
            }
        }

        // 선택 포인트가 이전포인트와 같을 경우, 변경된 값을 동기화 시켜 보여주기 위해
        if ( preWasIdEditValue == rdWasId ) {
            rdWasId     = preWasIdEditValue;
            rdWasName   = preWasNameEditValue;
            rdHostName  = preHostNameEditValue;
            rdTierId    = preTierIdValue;
        }

        // 선택된 값들이 다시 이전 선택들의 값이 되기 위해
        beforeObjOne.wasId      = rdWasId;
        beforeObjOne.wasName    = rdWasName;
        beforeObjOne.hostName   = rdHostName;
        beforeObjOne.tierId     = rdTierId;

        preWasIdEdit.setDisabled(true);
        preWasIdEdit.setValue(rdWasId);
        preWasNameEdit.setValue(rdWasName);
        preHostNameEdit.setValue(rdHostName);
        if(typeof rdTierId === 'number' ){
            preTierId.ajaxSelectByValue(rdTierId);
        } else {
            preTierId.ajaxSelectByName(rdTierId);
        }

        return true;
    },


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    save: function() {
        this.tierComboBox.store.loadData(this.tierComboBox.data);
        var self = this;
        // 넣을 데이터 가져오기.
        var wasid = self.wasIdEdit.getValue();
        var wasname = self.wasNameEdit.getValue();
        var hostname = self.hostNameEdit.getValue();
        var tierId  = this.tierComboBox.getValue();
        var cusorPointCheck = false;
        var ix, ixLen;
        var ds = {};
        var itemChange = false;

        if(typeof tierId === 'string' ){
            tierId = this.tierComboBox.ajaxGetValueDataByName(tierId);
        }

        if(!self.dataCheck(itemChange)){
            return;
        }

        // 마지막 변경사항 추가하기 위해
        if ( self.beforeObj.wasId == wasid ) {
            cusorPointCheck = true;
        }

        if ( self.mode == 'Add' ){
            ds.sql_file = 'IMXConfig_Insert_WasInfo.sql';
            ds.bind = [{
                name: 'wasId',
                value: wasid,
                type : SQLBindType.INTEGER
            }, {
                name: 'wasName',
                value: wasname,
                type : SQLBindType.STRING
            }, {
                name: 'hostName',
                value: hostname,
                type : SQLBindType.STRING
            }, {
                name: 'alertGroupName',
                value: null,
                type : SQLBindType.STRING
            }, {
                name: 'tierId',
                value: tierId,
                type : SQLBindType.INTEGER
            }];
            if(common.Util.isMultiRepository()) {
                ds.database = cfg.repositoryInfo.currentRepoName;
            }
            try {
                WS.SQLExec(ds, function() {
                    var record = self.was_grid.findRow('was_id', wasid);
                    if (record) {
                        self.parent.changeWasInfo(wasid, wasname, hostname, tierId);
                        Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
                    }
                    Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
                    // 변경사항 여부 체크
                    self.isWasNameModifiedAll = true;
                    self.removeAllRefArray();
                    self.CancelButton.fireEvent('click');
                }, this);
            } finally {
                wasid = null;
                wasname = null;
                hostname = null;
            }
        } else {
            // Edit mode
            var refObjArray = self.referenceObjArray;

            //마지막 변경사항 추가 이전 같은 was_id값을 가진 referenceObjArray 제거.
            for( ix = 0; ix < refObjArray.length; ix++){
                if( cusorPointCheck && refObjArray[ix].wasId === wasid ){
                    self.removeRefArray(ix);
                }
            }

            // 마지막 변경사항 추가하기 위해
            if ( cusorPointCheck ) {
                self.addRefArray(wasid, wasname, hostname, tierId);
            }

            for (ix = 0, ixLen = refObjArray.length; ix < ixLen; ix++) {
                var currentData = {};
                var currentWasId = refObjArray[ix].wasId;
                var currentWasName = refObjArray[ix].wasName;
                var currentHostName = refObjArray[ix].hostName;
                var currentTierId = refObjArray[ix].tierId;
                var record = self.was_grid.findRow('was_id', currentWasId);
                var currentTierIdText = this.tierComboBox.ajaxGetNameDataByValue(currentTierId);
                if(!currentTierIdText){
                    currentTierId = null;
                }

                //save 시 입력이 안된 에이전트명 및 호스트명을 전체 체크.
                if ( currentWasName == '') {
                    Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Please enter the remaining Agent Names.'));
                    return;
                }


                if (currentHostName == '') {
                    Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Please enter the remaining Host Names.'));
                    return;
                }

                if (record) {
                    self.parent.changeWasInfo(currentWasId, currentWasName, currentHostName, currentTierIdText);
                    self.setGridRow(currentWasId, currentWasName, currentHostName, currentTierIdText);

                    if(ix == ixLen - 1){
                        self.beforeObj.wasId = currentWasId;
                        self.beforeObj.wasName = currentWasName;
                        self.beforeObj.hostName = currentHostName;
                        self.beforeObj.tierId = currentTierId;
                    }
                }

                currentData.tierId = currentTierId;
                currentData.HostName = currentHostName;
                currentData.WasName = currentWasName;
                currentData.WasId = currentWasId;
                currentData.start = ix+1;
                currentData.end = ixLen;
                this.hostNameUpdate(currentData);
                this.getHostIP(currentData);
                this.editUpdate(currentData);
            }
            /**
             * 수정일때 저장을 눌러도 창이 닫히지 않도록 하기위해 주석처리.
             * self.CancelButton.fireEvent('click');
             */
        }
    },

    editUpdate : function(currentData) {
        var dataSet = {};
        var self = this;

        dataSet.sql_file = 'IMXConfig_Edit_WasInfo.sql';
        dataSet.bind = [{
            name: 'host_name',
            value: currentData.HostName,
            type : SQLBindType.STRING
        }, {
            name: 'was_name',
            value: currentData.WasName,
            type : SQLBindType.STRING
        }, {
            name: 'tier_id',
            value: currentData.tierId,
            type : SQLBindType.INTEGER
        }];

        dataSet.replace_string = [{
            name: 'was_id',
            value: parseInt(currentData.WasId)
        }];

        // 변경사항 여부 체크
        self.isWasNameModifiedAll = true;

        if(common.Util.isMultiRepository()) {
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function() {
            if(currentData.start === currentData.end){
                self.removeAllRefArray();
                Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
            }
        }, this);


    },

    hostNameUpdate: function(currentData){
        var dataSet = {};
        dataSet.sql_file = 'IMXConfig_Update_Host_Name.sql';
        dataSet.bind = [{
            name: 'host_name',
            value: currentData.HostName,
            type : SQLBindType.STRING
        }, {
            name: 'was_id',
            value: currentData.WasId,
            type : SQLBindType.INTEGER
        }];

        if(common.Util.isMultiRepository()) {
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(){}, this);
    },

    getHostIP: function(currentData){
        if(this.batchCheckBox.getValue()){
            this.currentData = currentData;
            var dataSet = {};
            var self = this;
            dataSet.sql_file = 'IMXConfig_Get_Host_Ip.sql';
            dataSet.bind = [{
                name: 'server_id',
                value: currentData.WasId,
                type : SQLBindType.INTEGER
            }];

            if(common.Util.isMultiRepository()) {
                dataSet.database = cfg.repositoryInfo.currentRepoName;
            }

            WS.SQLExec(dataSet, function(aheader, adata){
                if(adata.rows){
                    var host_ip = adata.rows[0][0];
                    self.batchWasHostName(host_ip,self.currentData);
                } else{
                    console.debug('fail get host_ip');
                    console.debug('xapm_server_time check the table.');
                }
            }, this);
        }
    },

    batchWasHostName : function(host_ip,currentData){
        var dataSet = {};
        dataSet.sql_file = 'IMXConfig_Batch_Was_Host_Name.sql';
        dataSet.bind = [{
            name: 'host_name',
            value: currentData.HostName,
            type : SQLBindType.STRING
        }, {
            name: 'host_ip',
            value: host_ip,
            type : SQLBindType.STRING
        }];

        if(common.Util.isMultiRepository()) {
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

    /**
     * itemClick 을 통해 dataCheck 시 에이전트명과 호스트명 제외
     * @param itemChange
     * @returns {boolean}
     */
    dataCheck: function(itemChange){
        var self = this;
        // 넣을 데이터 가져오기.
        var wasname = self.wasNameEdit.getValue();
        var hostname = self.hostNameEdit.getValue();
        var ix;

        // CHECK: WAS NAME + Byte Check
        if ( wasname == '' && !itemChange) {
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Please enter Agent name.'));
            self.wasNameEdit.focus();
            return false;
        }

        if ( wasname.indexOf(' ') > -1 ){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Blank Character is not allowed'));
            self.wasNameEdit.focus();
            return false;
        }

        var wasNameByteLen = this.getTextLength(wasname);

        if(wasNameByteLen > 128){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('You have exceeded the number of byte of the column you want to save.'));
            self.wasNameEdit.focus();
            return false;
        }

        // CHECK: HOST NAME + Byte Check
        if (hostname == '' && !itemChange) {
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Please enter host name.'));
            self.hostNameEdit.focus();
            return false;
        }

        if ( hostname.indexOf(' ') > -1 ){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Blank Character is not allowed'));
            self.hostNameEdit.focus();
            return false;
        }

        var hostNameByteLen = this.getTextLength(hostname);

        if(hostNameByteLen > 64){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('You have exceeded the number of byte of the column you want to save.'));
            self.hostNameEdit.focus();
            return false;
        }

        // CHECK: WAS ID 중복 체크
        if (self.mode == 'Add') {
            for (ix = 0; ix < self.parent.wasGrid.getRowCount(); ix++) {
                if (self.parent.wasGrid.getRow(ix).data.was_id == wasid) {
                    Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Agent ID is already registered.'));
                    return false;
                }
            }
        }

        // CHECK: WAS NAME 중복 체크
        if (self.mode == 'Add') {
            for (ix = 0; ix < self.parent.wasGrid.getRowCount(); ix++) {
                if (self.parent.wasGrid.getRow(ix).data.was_name == wasname) {
                    Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Agent name is already registered.'));
                    self.wasNameEdit.focus();
                    return false;
                }
            }
        }else{
            //edit mode
            for (ix = 0; ix < self.parent.wasGrid.getRowCount(); ix++) {
                if (self.parent.wasGrid.getRow(ix).data.was_name == wasname) {
                    if(itemChange){
                        //월래 가지고 있던 값, 에이전트명이 없을 경우 제외
                        if(wasname === '' || self.beforeObj.wasId === wasid){
                            continue;
                        }
                        Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Agent name is already registered.'));
                        self.wasNameEdit.focus();
                        return false;
                    } else{
                        if(self.parent.wasGrid.getRow(ix).data.was_id === wasid){
                            continue;
                        }
                        Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Agent name is already registered.'));
                        self.wasNameEdit.focus();
                        return false;
                    }
                }
            }
        }
        return true;
    },

    setGridRow: function(wasid, wasname, hostname, tierId) {
        var ix, ixLen;
        for (ix = 0, ixLen = this.was_grid.getRowCount(); ix < ixLen; ix++) {
            if (this.was_grid.getRow(ix).data.was_id == wasid) {
                var record = this.was_grid.findRow('was_id', wasid);

                record.set('was_name', wasname);
                record.set('host_name', hostname);
                record.set('tier_id', tierId);
                break;
            }
        }
    },

    addRefArray: function (wasId, wasName, hostName, tierIdTextValue) {
        var self = this;

        var tempObj = {
            wasId: wasId,
            wasName: wasName,
            hostName: hostName,
            tierId  : tierIdTextValue
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
