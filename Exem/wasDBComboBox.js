/**
 * Created by JONGHO on 14. 2. 19.
 * 1502.27 fix 5.0 modify by min
 */
Ext.define('Exem.wasDBComboBox', {
    extend          : 'Exem.Container',
    width           : 100,                      // comboBox 배경의 width
    height          : 30,                       // comboBox 배경의 height
    selectType      : common.Util.TR('Agent'),                    // select Type 은   WAS <==> DB /*1501.26 WAS -> Agent 로 명칭변경 by han.*/
    fieldLabel      : null,
    comboWidth      : 150,                      // comboBox 자체의 width
    comboLabelWidth : 30,                       // comboBox Label 의 width
    layout          : 'hbox',
    multiSelect     : false,                    // true 면 muilt Select 가능.
    addSelectAllItem: true,                     // comboBox에 (All) item을 추가할것이지 여부

    isAddOldServer  : true,                   // 현재는 모니터링 대상이 아니지만 Auto Scale 기능으로 추가가 되었던 서버 정보도 표시를 할지 구분하는 값

    constructor: function() {
        this.callParent(arguments);

        this.WasListData      = [];
        this.AllWasList       = [];
        this.DBListData       = [];
        this.AllDBList        = [];
        this.HostListData     = [];
        this.AllHostList      = [];
        this.BusinessListData = [];
        this.AllBusinessList  = [];
        this.TPListData       = [];
        this.AllTPList        = [];
        this.CDListData       = [];
        this.AllCDList        = [];
        this.WSListData       = [];
        this.AllWSList        = [];
        this.MultiListData    = [];
        this.AllMultiList     = [];
        this.monitorType      = window.prevMonitorType ? window.prevMonitorType : window.rtmMonitorType;

        if (this.linkMonitorType) {
            this.monitorType = this.linkMonitorType;
        }

        this.agentInfo = this.setAgentInfo();
        this.agentIdArr = this.setAgentIdArr();

        this.addCombobox();
        this._getServiceInfo();
    },

    listeners: {
        beforedestroy: function() {
            Ext.destroy(this.SelectWASGroup);
        }
    },

    init: function() {},

    /*
     *  Comm.serverInfo를 기반으로 각 모니터링 타입에 맞는 agetnObject return
     * */
    setAgentInfo: function() {
        var key, typeKey, setSvrInfo;
        var ix, ixLen, serverId, oldSvrInfo;


        // 독립 객체로 Obj Copy. 사이드 이펙트 최소화를 위함.
        // Comm.serverInfo와 별개로 현 객체에서 내부적으로 Agent 데이터 처리
        if (Comm.isWooriDash) {
            return Comm.wasInfoObj;
        } else {
            setSvrInfo = common.Util.deepObjCopy(Comm.serverInfoObj);


            if (this.isBizView) {
                //업무관점 모니터링에서 장기추이가 들어온 경우
                setSvrInfo['E2E'] = {};

                for (typeKey in setSvrInfo) {
                    for (key in setSvrInfo[typeKey]) {
                        if (this.agentIdList.indexOf(key) !== -1) {
                            setSvrInfo['E2E'][key] = setSvrInfo[typeKey][key];
                        }
                    }
                }
            } else {
                // TP 정보가 WAS객체에 중복으로 들어있으므로 삭제 처리 필요
                if (this.monitorType === 'WAS') {
                    for (key in setSvrInfo['WAS']) {
                        if (setSvrInfo['WAS'][key].type && setSvrInfo['WAS'][key].type !== this.monitorType) {
                            delete setSvrInfo['WAS'][key];
                        }
                    }
                } else if (this.monitorType === 'E2E') {

                    for (key in setSvrInfo['WAS']) {
                        if (setSvrInfo['WAS'][key].type && setSvrInfo['WAS'][key].type !== 'WAS') {
                            delete setSvrInfo['WAS'][key];
                        }
                    }
                    setSvrInfo[this.monitorType] = {};

                    for (typeKey in setSvrInfo) {
                        for (key in setSvrInfo[typeKey]) {
                            setSvrInfo[this.monitorType][key] = setSvrInfo[typeKey][key];
                        }
                    }
                }

                // Auto Scale 처리로 삭제된 서버 정보도 PA에서 조회가 가능하게 하기 위해 목록 설정
                if (this.isAddOldServer && Comm.oldServerIdArr && Comm.oldServerIdArr.length > 0 && setSvrInfo.WAS) {
                    oldSvrInfo = common.Util.deepObjCopy(Comm.oldServerInfo);

                    for (ix = 0, ixLen = Comm.oldServerIdArr.length; ix < ixLen; ix++) {
                        serverId = Comm.oldServerIdArr[ix];

                        if (!setSvrInfo.WAS[serverId]) {
                            setSvrInfo.WAS[serverId] = oldSvrInfo[serverId];
                        }
                    }
                }
            }

            if (this.isBizView) {
                return setSvrInfo[this.selectRadioType || 'E2E'];
            } else {
                return setSvrInfo[this.selectRadioType || this.monitorType];
            }
        }
    },

    setAgentIdArr: function() {
        var ix, ixLen,
            serverId,
            setSvrIdObj = {};

        if (this.monitorType === 'WAS') {
            setSvrIdObj[this.monitorType] = Comm.wasIdArr.slice();

            for (ix = 0, ixLen = setSvrIdObj[this.monitorType].length; ix < ixLen; ix++) {
                serverId = setSvrIdObj[this.monitorType][ix];

                if (Comm.tpIdArr.indexOf(serverId) > -1 || Comm.cdIdArr.indexOf(serverId) > -1) {
                    setSvrIdObj[this.monitorType].splice(ix, 1);
                    ix--;
                    ixLen--;
                }
            }
        } else if (this.monitorType === 'TP') {
            setSvrIdObj[this.monitorType] = Comm.tpIdArr.slice();
        } else if (this.monitorType === 'TUX') {
            setSvrIdObj[this.monitorType] = Comm.tuxIdArr.slice();
        } else if (this.monitorType === 'CD') {
            setSvrIdObj[this.monitorType] = Comm.cdIdArr.slice();
        } else if (this.monitorType === 'WEB') {
            setSvrIdObj[this.monitorType] = Comm.webIdArr.slice();
        } else {  // E2E
            setSvrIdObj[this.monitorType] = Comm.wasIdArr.slice();
            setSvrIdObj[this.monitorType] = Comm.wasIdArr.concat(Comm.webIdArr).slice();
        }

        // Auto Scale 처리로 삭제된 서버 정보도 PA에서 조회가 가능하게 하기 위해 목록 설정
        if (this.isAddOldServer && Comm.oldServerIdArr && Comm.oldServerIdArr.length > 0 && setSvrIdObj.WAS) {

            for (ix = 0, ixLen = Comm.oldServerIdArr.length; ix < ixLen; ix++) {

                if (setSvrIdObj.WAS.indexOf(Comm.oldServerIdArr[ix]) === -1) {
                    setSvrIdObj.WAS.push(Comm.oldServerIdArr[ix]);
                }
            }
        }
        return setSvrIdObj[this.monitorType];
    },

    addCombobox: function() {
        var self = this;
        var labelName = null;
        this.fieldLabel == null ?  labelName = this.selectType : labelName = this.fieldLabel;

        if(labelName === common.Util.TR('Agent') && this.monitorType === 'WEB') {
            labelName = common.Util.TR('WebServer');
        }

        this.WASDBCombobox = Ext.create('Exem.AjaxComboBox',{
            width : this.comboWidth,
            data  : [],
            margin: '0 0 0 5',
            fieldLabel : labelName,
            multiSelect: self.multiSelect,
            labelSeparator: '',
            forceSelection: !self.multiSelect,
            labelWidth : this.comboLabelWidth,
            nowSelectedValue: null,
            listeners: {
                blur: function(combo) {
                    var selectName, selectNameList,
                        selectRecord, selectedValues,
                        ix, ixLen, jx, jxLen;

                    selectName = this.getRawValue();
                    if (selectName == null || selectName == '') {
                        this.reset();
                        if (this.getStore().getCount()) {
                            this.setValue( common.Util.TR('(All)') );
                        }
                        return;
                    }

                    selectNameList = [];
                    selectedValues = [];

                    // 업무명의 경우 공백을 업무명에 넣는 경우가 있어 if문으로 분리
                    if (common.Util.TR(self.selectType) !== common.Util.TR('Business')) {
                        selectName = selectName.replace(/\s/gi, '');
                    }
                    if (this.multiSelect) {
                        selectNameList = selectName.split(',');
                    } else {
                        selectNameList.push(selectName);
                    }

                    this.searchQuery(this.data, '');

                    for (ix = 0, ixLen = selectNameList.length; ix < ixLen; ix++) {
                        for (jx = 0, jxLen = this.store.getCount(); jx < jxLen; jx++) {
                            selectRecord = this.store.findRecord('name', selectNameList[ix], 0, false, false, true);
                            if (selectRecord) {
                                selectedValues.push(selectRecord);
                                break;
                            }
                        }
                    }

                    if (selectedValues.length < 1 || selectNameList.length != selectedValues.length) {
                        this.searchQuery(this.data, '');
                        self.showMessage(
                            common.Util.TR('ERROR'),
                            common.Util.TR('The %1 name is invalid', this.fieldLabel),
                            Ext.Msg.OK,
                            Ext.MessageBox.ERROR,
                            null
                        );

                        return;
                    }

                    this.searchQuery(this.data, '');

                    this.fireEvent('select', combo, selectedValues);
                },
                select: function(combo, records) {
                    var lastSelect;

                    if (this.multiSelect) {
                        // multiSelect인 경우 record는 array로 들어온다.마지막에 선택된게 (All)이면 나머지는 해제.
                        lastSelect = records[records.length - 1];
                        if (this.getValue() !== null) {
                            if (lastSelect.data.name === common.Util.TR('(All)')) {
                                this.reset();
                                this.setValue( common.Util.TR('(All)') );
                            } else {
                                if (this.getValue().indexOf( common.Util.TR('(All)') ) !== -1) {
                                    this.reset();
                                    this.setValue(lastSelect.data.value);
                                }
                            }
                        } else {
                            if (this.getRawValue().indexOf(common.Util.TR('(All)') ) === -1) {
                                this.reset();
                                this.setValue(records);
                            }
                        }
                    }
                },
                change: function() {
                    var select = this.getValue();
                    if (Array.isArray(select) === true) {
                        if (select.length === 0) {
                            this.reset();
                            if (this.getStore().getCount()) {
                                this.setValue( common.Util.TR('(All)') );
                            }
                        } else {
                            this.nowSelectedValue =  select.join();
                        }
                    } else {
                        this.nowSelectedValue = select;
                    }
                }
            },
            // WasSelectForm에서 comboBox로 wasid List를 받아온다.
            setWasListId: function(agentIdList) {
                this.nowSelectedValue = null;
                this.nowSelectedValue = agentIdList;
            }
        });

        this.add(this.WASDBCombobox);

        this.WASDBCombobox.getStore().sort({property: 'name', direction: 'ASC'});

    },

    _getServiceInfo: function() {
        var self = this;
        var key;
        var objKeys, serverId;
        var ix, ixLen, jx, jxLen, allBusinessID, intervalChecker;
        var mergeInfoObj = {};
        var mergeArr = [];

        function callback() {
            var keys, key, ix, ixLen;

            keys = Object.keys(Comm.dbInfoObj);
            for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
                key = keys[ix];

                if (Comm.dbInfoObj[key] == null) {
                    continue;
                }
                this.DBListData.push({name: Comm.dbInfoObj[key].instanceName, value: key});
                this.AllDBList.push(key);
            }

            this.comboBoxSetData(this.DBListData);
        }

        //초기화
        this.WasListData      = [];
        this.AllWasList       = [];
        this.DBListData       = [];
        this.AllDBList        = [];
        this.HostListData     = [];
        this.AllHostList      = [];
        this.TPListData       = [];
        this.AllTPList        = [];
        this.TuxListData      = [];
        this.AllTuxList       = [];
        this.CDListData       = [];
        this.AllCDList        = [];
        this.WSListData       = [];
        this.AllWSList        = [];
        this.BusinessListData = [];
        this.AllBusinessList  = [];
        this.MultiListData    = [];
        this.AllMultiList     = [];

        if ((this.selectType === common.Util.TR('Agent') || this.selectType === 'Agent') && this.monitorType !== 'E2E') {
            if (this.findIcon) {
                this.findIcon.destroy();
            }

            if (_.size(this.agentInfo) > 0) {
                this.loadWasInfo();
            } else {
                intervalChecker = setInterval( function() {
                    if ( _.size(self.agentInfo) > 0 ) {
                        clearInterval(intervalChecker);
                        self.loadWasInfo();
                    }
                }, 50);
            }
        } else if ((this.selectType === common.Util.TR('Agent') || this.selectType === 'Agent') && this.monitorType === 'E2E') {
            if (this.findIcon) {
                this.findIcon.destroy();
            }

            // Auto Scale 되었던 서버 정보도 추가
            if (this.isAddOldServer) {
                Ext.Object.merge(mergeInfoObj, Comm.oldServerInfo);
            }

            Ext.Object.merge(mergeInfoObj, Comm.wasInfoObj);

            objKeys = Object.keys(mergeInfoObj);

            for (ix = 0, ixLen = objKeys.length; ix < ixLen; ix++) {
                serverId = +objKeys[ix];

                if (mergeInfoObj[serverId].type === 'WAS') {
                    this.WasListData.push({ name : mergeInfoObj[serverId].wasName, value : serverId });
                    this.AllWasList.push(serverId);
                }
            }

            this.comboBoxSetData(this.WasListData);

            this.agentIdArr = this.AllWasList;
            this.agentInfo = this.setAgentInfo();

            if (this.multiSelect === true) {
                this._addFindIcon();
            }
        }

        if (this.selectType === common.Util.TR('TP') || this.selectType === 'TP') {
            if (this.findIcon) {
                this.findIcon.destroy();
            }

            objKeys = Object.keys(Comm.tpInfoObj);
            for (ix = 0, ixLen = objKeys.length; ix < ixLen; ix++) {
                key = objKeys[ix];

                this.TPListData.push({ name : Comm.tpInfoObj[key].name, value : Comm.tpInfoObj[key].id });
                this.AllTPList.push(Comm.tpInfoObj[key].id);
            }

            this.comboBoxSetData(this.TPListData);

            this.agentIdArr = this.AllTPList;
            this.agentInfo = this.setAgentInfo();

            if (this.multiSelect === true) {
                this._addFindIcon();
            }
        }

        if (this.selectType === common.Util.TR('Tuxedo') || this.selectType === 'Tuxedo') {
            if (this.findIcon) {
                this.findIcon.destroy();
            }

            objKeys = Object.keys(Comm.tuxInfoObj);
            for (ix = 0, ixLen = objKeys.length; ix < ixLen; ix++) {
                key = objKeys[ix];

                this.TuxListData.push({ name : Comm.tuxInfoObj[key].name, value : Comm.tuxInfoObj[key].id });
                this.AllTuxList.push(Comm.tuxInfoObj[key].id);
            }

            this.comboBoxSetData(this.TuxListData);

            this.agentIdArr = this.AllTuxList;
            this.agentInfo = this.setAgentInfo();

            if (this.multiSelect === true) {
                this._addFindIcon();
            }
        }

        if (this.selectType === common.Util.TR('C_Daemon') || this.selectType === 'C_Daemon') {
            if (this.findIcon) {
                this.findIcon.destroy();
            }

            objKeys = Object.keys(Comm.cdInfoObj);
            for (ix = 0, ixLen = objKeys.length; ix < ixLen; ix++) {
                key = objKeys[ix];

                this.CDListData.push({ name : Comm.cdInfoObj[key].name, value : Comm.cdInfoObj[key].id });
                this.AllCDList.push(Comm.cdInfoObj[key].id);
            }

            this.comboBoxSetData(this.CDListData);

            this.agentIdArr = this.AllCDList;
            this.agentInfo = this.setAgentInfo();

            if (this.multiSelect === true) {
                this._addFindIcon();
            }
        }

        if (this.selectType === common.Util.TR('WebServer') || this.selectType === 'WebServer') {
            if (this.findIcon) {
                this.findIcon.setVisible(false);
            }

            objKeys = Object.keys(Comm.webServersInfo);
            for (ix = 0, ixLen = objKeys.length; ix < ixLen; ix++) {
                key = objKeys[ix];

                this.WSListData.push({ name : Comm.webServersInfo[key].name, value : Comm.webServersInfo[key].id });
                this.AllWSList.push(Comm.webServersInfo[key].id);
            }

            this.comboBoxSetData(this.WSListData);
        }

        if (this.selectType === 'DB') {
            common.DataModule.getDbStore(callback, this);

            if (this.findIcon) {
                this.findIcon.setVisible(false);
            }
        }

        if (this.selectType === common.Util.TR('Host')) {
            if (this.findIcon) {
                this.findIcon.setVisible(false);
            }

            for (ix = 0, ixLen = Comm.monitoringHosts.length; ix < ixLen; ix++) {
                this.HostListData.push({name : Comm.monitoringHosts[ix][0], value : Comm.monitoringHosts[ix][2]});
                this.AllHostList.push(Comm.monitoringHosts[ix][2]);
            }

            this.comboBoxSetData(this.HostListData);
        }

        if (this.selectType === common.Util.TR('Business')) {
            if (this.findIcon) {
                this.findIcon.setVisible(false);
            }

            if (Comm.businessRegisterInfo.length === 0) {
                for (ix = 0, ixLen = Comm.learnBizInfo.length; ix < ixLen; ix++) {
                    this.BusinessListData.push({ name : Comm.learnBizInfo[ix].bizName, value : Comm.learnBizInfo[ix].bizId });
                }
            } else {
                for (ix = 0, ixLen = Comm.businessRegisterInfo.length; ix < ixLen; ix++) {
                    allBusinessID = common.Util.getAllBizList(Comm.businessRegisterInfo[ix].parent.bizId);
                    this.BusinessListData.push({ name : Comm.businessRegisterInfo[ix].parent.bizName, value : allBusinessID.join(',') });

                    for (jx = 0, jxLen = allBusinessID.length; jx < jxLen; jx++) {
                        this.AllBusinessList.push(allBusinessID[jx]);
                    }
                }
            }

            this.comboBoxSetData(this.BusinessListData);
        }

        if (this.selectType === 'MultiTotal') { // 외국환중개 - 전체 조회가 필요해서 추가함
            if (this.findIcon) {
                this.findIcon.destroy();
            }

            mergeArr = [Comm.tpInfoObj, Comm.cdInfoObj];

            for (ix = 0, ixLen = mergeArr.length; ix < ixLen; ix++) {
                objKeys = Object.keys(mergeArr[ix]);

                for (jx = 0, jxLen = objKeys.length; jx < jxLen; jx++) {
                    key = objKeys[jx];
                    this.AllMultiList.push(mergeArr[ix][key].id);
                }
            }
            this.comboBoxSetData(this.MultiListData);
        }
    },

    comboBoxSetData : function(comboData) {
        if (this.addSelectAllItem === true) {
            comboData.unshift({name:'(All)', value: '(All)'});
        }

        this.WASDBCombobox.setData(comboData);
        this.WASDBCombobox.setSearchField('name');
        this.WASDBCombobox.select(this.WASDBCombobox.store.getAt(0));
    },

    loadWasInfo : function() {
        var key, agentName;
        var keys, key, ix, ixLen, jx, jxLen;

        if (_.size(Comm.sap) > 0 && Comm.sap['top']) {

            keys = Object.keys(Comm.sap);
            for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
                key = keys[ix];

                if ( key === 'top' ) {
                    continue;
                }

                for (jx = 0, jxLen = Comm.sap[key].length; jx < jxLen; jx++) {
                    this.WasListData.push({id: Comm.sap[key][jx][0], name: Comm.sap[key][jx][1], value: key});
                    this.AllWasList.push(key);
                }
            }
            jx = null;

            if (this.addSelectAllItem === true) {
                this.WasListData.unshift({name:'(All)', value: '(All)'});
            }

        } else {
            if (this.agentInfo) {
                keys = Object.keys(this.agentInfo);
                for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
                    key = keys[ix];

                    if (!this.agentInfo[key]) {
                        continue;
                    }

                    agentName = this.agentInfo[key].name || this.agentInfo[key].wasName;

                    this.WasListData.push({id: agentName, name: agentName, value: key});
                    this.AllWasList.push(key);
                }

                if (this.addSelectAllItem === true && this.WasListData.length) {
                    this.WasListData.unshift({name:'(All)', value: '(All)'});
                }
            } else {
                console.warning('Check Monitor Type and Server Info Object.');
            }
        }

        this.WASDBCombobox.setData(this.WasListData);
        this.WASDBCombobox.setSearchField('name');
        this.WASDBCombobox.select(this.WASDBCombobox.store.getAt(0));

        this.agentIdArr = this.AllWasList;
        this.agentInfo = this.setAgentInfo();

        if (this.multiSelect === true) {
            this._addFindIcon();
        }
    },

    // 검색 돋보기 모양 아이콘 추가
    _addFindIcon: function() {
        var self = this;

        var isSap = _.size(Comm.sap) > 0 && Comm.sap['top'];

        var ix,ixLen,jx,jxLen,
            hostArr, hostList, wasList,groupName,wasId,groupVal, treeData;
        var businessListCheck = false;
        var hostInfo = {};

        hostArr = this.monitorType === 'WEB' ? Comm.webHosts : this.isAddOldServer ? Comm.hosts.concat(Comm.oldHosts) : Comm.hosts;

        for (ix = 0, ixLen = hostArr.length; ix < ixLen; ix++) {
            groupName = hostArr[ix];
            hostList = [];

            if (Ext.isEmpty(groupName)) {
                continue;
            }
            for (jx = 0,jxLen = this.agentIdArr.length; jx < jxLen; jx++) {
                wasId = this.agentIdArr[jx];
                groupVal = this.monitorType === 'WEB' ?  Comm.RTComm.getWebGroupNameByType(0, wasId) : Comm.RTComm.getGroupNameByType(0, wasId);

                if (groupName === groupVal) {
                    if (this.agentInfo[wasId]) {
                        wasList = [];
                        wasList.push(wasId + '', this.agentInfo[wasId].name || this.agentInfo[wasId].wasName);

                        hostList.push(wasList);
                    }
                }
            }

            if (hostList.length) {
                hostInfo[groupName] = hostList;
            }

        }
        // Web모니터링은 업무그룹 설정이 없으므로 표출 안함.
        if (Comm.bizGroups.length && this.monitorType !== 'WEB') {
            businessListCheck = true;
        }

        if (Comm.isWooriDash) {
            businessListCheck = true;
            treeData = Comm.bizGroupWasNamePairObj;
        } else {
            treeData = hostInfo;
        }

        this.findIcon = Ext.create('Exem.TreeWindow', {
            title               : common.Util.TR('Select Agent'),
            comboType           : isSap ? 'sap' : 'was',
            treeData            : isSap ? Comm.sap : treeData,
            connectComboBox     : self.WASDBCombobox,
            businessListCheck   : businessListCheck,
            isRTM               : this.isRTM,
            monitorType         : this.selectRadioType || this.monitorType,
            agentInfo           : this.agentInfo,
            agentIdArr          : this.agentIdArr
        });

        this.findIcon.init();

        if (!this.isBizView) {
            this.add(this.findIcon);
        }
    },


    getValue: function() {
        var self = this,
            comboBoxValue, rawValues, selectedValues = [], rawData,
            ix, ixLen;

        if (self.disabled) {
            return;
        }

        if (self.WASDBCombobox.rawValue == '(All)') {
            if (common.Util.TR(this.selectType) == common.Util.TR('Agent')) {
                self.WASDBCombobox.nowSelectedValue = this.AllWasList.join();
            } else if (common.Util.TR(this.selectType) == common.Util.TR('WebServer')) {
                self.WASDBCombobox.nowSelectedValue = this.AllWSList.join();
            } else if (common.Util.TR(this.selectType) == common.Util.TR('TP')) {
                self.WASDBCombobox.nowSelectedValue = this.AllTPList.join();
            } else if (common.Util.TR(this.selectType) == common.Util.TR('Tuxedo')) {
                self.WASDBCombobox.nowSelectedValue = this.AllTuxList.join();
            } else if (common.Util.TR(this.selectType) == common.Util.TR('C_Daemon')) {
                self.WASDBCombobox.nowSelectedValue = this.AllCDList.join();
            } else if (this.selectType == 'DB') {
                self.WASDBCombobox.nowSelectedValue = this.AllDBList.join();
            } else if (this.selectType == 'Host') {
                self.WASDBCombobox.nowSelectedValue = this.AllHostList.join();
            } else if (common.Util.TR(this.selectType) == common.Util.TR('Business')) {
                self.WASDBCombobox.nowSelectedValue = this.AllBusinessList.join();
            } else if (common.Util.TR(this.selectType) === 'MultiTotal') {
                self.WASDBCombobox.nowSelectedValue = this.AllMultiList.join();
            }
        } else {
            comboBoxValue = this.WASDBCombobox.getValue();
            if (typeof(comboBoxValue) == 'string') {
                self.WASDBCombobox.nowSelectedValue = comboBoxValue;
            } else if (typeof(comboBoxValue) == 'object' && comboBoxValue != null ) {
                self.WASDBCombobox.nowSelectedValue = comboBoxValue.join();

            } else {
                // 업무명의 경우 공백, 쉼표를 업무명에 넣는 경우가 있어 if문으로 분리
                if (common.Util.TR(this.selectType) !== common.Util.TR('Business')) {
                    rawValues = _.map(self.WASDBCombobox.rawValue.split(','), function(str) {
                        return str.trim();
                    });
                } else {
                    rawValues = [self.WASDBCombobox.rawValue];
                }

                if (rawValues && rawValues.length > 0) {
                    for (ix = 0, ixLen = this.WASDBCombobox.data.length; ix < ixLen; ix++) {
                        rawData = this.WASDBCombobox.data[ix];
                        if (Ext.Array.contains(rawValues, rawData.name )) {
                            selectedValues.push(rawData.value);
                        }
                    }

                    if (selectedValues && selectedValues.length > 0 && rawValues.length === selectedValues.length) {
                        self.WASDBCombobox.nowSelectedValue = selectedValues.join();
                    } else {
                        self.WASDBCombobox.nowSelectedValue = '-1';
                    }
                }
            }
        }

        return self.WASDBCombobox.nowSelectedValue;
    },


    getWasNames: function() {
        var self = this, wasnameList = [],
            keys, key, ix, ixLen;

        try {
            if (self.WASDBCombobox.rawValue === '(All)') {

                keys = Object.keys(this.agentInfo);
                for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
                    key = keys[ix];
                    wasnameList[wasnameList.length] = this.agentInfo[key].name || this.agentInfo[key].wasName;
                }

                return wasnameList;
            } else {
                return self.WASDBCombobox.getRawValue();
            }
        } finally {
            keys        = null;
            wasnameList = null;
        }
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

    checkValid: function() {
        var val = this.getValue(),
            result = true, errorMsg,
            valArr, dbIdArr;

        if (val == null || val == '') {
            if (this.addSelectAllItem) {
                this.WASDBCombobox.select(this.WASDBCombobox.store.getAt(0));
            } else {
                errorMsg = common.Util.TR('Can not find the %1 Name', this.selectType);
                result = false;
            }
        } else {
            switch (this.selectType) {
                case common.Util.TR('Agent'):
                    valArr = _.map(val.split(','), function(str) {
                        return str;
                    });
                    if (_.difference(valArr, this.agentIdArr).length > 0) {
                        errorMsg = common.Util.TR('The %1 name is invalid', this.selectType);
                        result = false;
                    }
                    break;
                case common.Util.TR('DB'):
                    valArr = _.map(val.split(','), function(str) {
                        return Number(str);
                    });
                    dbIdArr = _.map(_.keys(Comm.dbInfoObj), function(str) {
                        return Number(str);
                    });
                    if (_.difference(valArr, dbIdArr).length > 0) {
                        errorMsg = common.Util.TR('The %1 name is invalid', this.selectType);
                        result = false;
                    }
                    break;
                default:
                    break;
            }
        }

        if (!result) {
            this.showMessage(
                common.Util.TR('ERROR'),
                errorMsg,
                Ext.Msg.OK,
                Ext.MessageBox.ERROR,
                null
            );
        }

        return result;
    },

    // value로 select 해주기.
    selectByValue: function(value) {
        var wasIdArr = String(value).split(','),
            wasNames = [],
            record,
            keys, key, ix, ixLen;

        keys = Object.keys(wasIdArr);
        for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
            key = keys[ix];

            if (wasIdArr[key] == null) {
                continue;
            }

            //fineReocrd() 를 기본값으로 사용해서 데이터를 찾는 경우 like 로 검색되어서 잘못된 정보를 찾을 수 있다.
            record = this.WASDBCombobox.getStore().findRecord('value', Number(wasIdArr[key]), 0, false, false, true);
            if (record) {
                wasNames.push(record.data.name);
            }
        }

        //// 0307 추가
        this.WASDBCombobox.setValue(value);
        this.WASDBCombobox.select(this.WASDBCombobox.getStore().findRecord('value', value, 0, false, false, true));
        this.WASDBCombobox.setWasListId(value);
    },

    // name으로 select 해주기.
    selectByName: function(name) {
        this.WASDBCombobox.select( this.WASDBCombobox.getStore().findRecord('name', name) );
    },

    // index로 select 해주기.
    selectByIndex: function(idx) {
        this.WASDBCombobox.select( this.WASDBCombobox.getStore().getAt(idx) );
    },

    selectByValues: function(value) {
        var wasNameArr = String(value).split(','),
            wasNames   = [],
            keys, key, ix, ixLen, record;

        keys = Object.keys(wasNameArr);
        for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
            key = keys[ix];

            if (wasNameArr[key] != null) {
                record = this.WASDBCombobox.getStore().findRecord('name', wasNameArr[key]);
                if (record) {
                    wasNames.push(record);
                }
            }
        }

        this.WASDBCombobox.select( wasNames );
    },

    selectByIndexs: function(idx) {
        var wasIdArr = String(idx).split(','),
            wasIds   = [],
            keys, key, ix, ixLen, record;

        keys = Object.keys(wasIdArr);
        for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
            key = keys[ix];

            if (wasIdArr[key] != null) {
                // fineReocrd() 를 기본값으로 사용해서 데이터를 찾는 경우 like 로 검색되어서 잘못된 정보를 찾을 수 있다.
                record = this.WASDBCombobox.getStore().findRecord('value', wasIdArr[key], 0, false, false, true);
                if (record) {
                    wasIds.push(record);
                }
            }
        }

        this.WASDBCombobox.select( wasIds );
    }
});
