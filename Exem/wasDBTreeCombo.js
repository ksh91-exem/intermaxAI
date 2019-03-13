Ext.define("Exem.wasDBTreeCombo", {
    extend: 'Exem.Container',
    width : '100%',
    height : '100%',
    autoScroll: true,
    layout : 'vbox',
    listeners : {
        afterlayout : function(){
            if(!this.isInit) {
                this.setTreeCombo();
                this.isInit = true;
            }

        }
    },

    constructor: function() {
        this.monitorType = window.rtmMonitorType;

        this.callParent(arguments);
        this.initProperty();
        this.initLayout();
    },

    initProperty: function() {
        this.findComboData = [];
        this.treeData = null;
        this.isInit = false;

        this.isBizGrpList = Comm.bizGroups.length ? true : false;
    },

    initLayout: function() {

        this.findCombo = Ext.create('Exem.AjaxComboBox', {
            fieldLabel: common.Util.TR('Find Agent'),
            labelWidth : 75,
            width: 200,
            height: 25,
            itemId: 'findCombo',
            selectType : common.Util.TR('Agent'),
            multiSelect: true,
            useSelectFirstRow : false,
            listeners: {
                beforedeselect : function ( combo , records ){
                    if(!this.comboReset){
                        this.selectChkAgent(records.data.name);
                    }
                }.bind(this),
                select: function( combo, records) {
                    this.comboReset = true;
                    var lastSelect = records[records.length-1];

                    combo.reset();
                    this.selectChkAgent(lastSelect.data.name);
                    combo.select(lastSelect, false);
                    this.comboReset = false;
                }.bind(this)
            }
        });

        this.allCheckbox = Ext.create('Ext.form.field.Checkbox',{
            boxLabel: 'All',
            checked : true,
            margin  : '0 0 5 5',
            stopFlag: false,
            listeners: {
                change: function() {
                    if (this.allCheckbox.stopFlag === false) {
                        if (this.allCheckbox.getValue() === false) {
                            this.setAllCheck(this.tree.getRootNode(), false);
                        } else {
                            this.setAllCheck(this.tree.getRootNode(), true);
                        }
                    }
                }.bind(this)
            }
        });

        var dataInfo = this.createDataList();

        this.treeStore = Ext.create('Ext.data.TreeStore', {
            root: dataInfo
        });

        this.tree = Ext.create('Ext.tree.Panel', {
            width: '100%',
            height: '100%',
            flex : 1,
            cls: 'left-condition-tree',
            collapsible: false,
            itemId: 'leftTree',
            collapsed: false,
            autoScroll: true,
            store: this.treeStore,
            rootVisible: false,
            animCollapse: false,
            beforeSelect: null,
            listeners: {
                select: function (thisTree, record) {
                    if (this.singleInstance) {
                        if (record.data.depth == 1) {
                            return;
                        }
                        if (this.tree.beforeSelect != null) {
                            if (this.tree.beforeSelect.data.text == record.data.text) {
                                this.tree.beforeSelect.set('checked', true);
                                record.set('checked', record.data.checked);
                            } else {
                                this.tree.beforeSelect.set('checked', false);
                                record.set('checked', !record.data.checked);
                            }
                        }
                        this.tree.beforeSelect = record;
                    }
                }.bind(this),
                checkchange: function (node, checked) {
                    if (!this.singleInstance) {
                        if (node.childNodes.length > 0) {
                            for (var ix = 0; ix < node.childNodes.length; ix++) {
                                node.childNodes[ix].set('checked', checked);
                            }
                        } else {
                            if (!checked) {
                                node.parentNode.set('checked', false);
                            } else {
                                var count = 0;
                                node.parentNode.cascadeBy(function (_node) {
                                    if (!_node.data.checked && _node.data.depth == 2) {
                                        count++;
                                    }
                                });
                                if (count == 0) {
                                    node.parentNode.set('checked', true);
                                }
                            }
                        }
                    } else if (this.singleInstance) {
                        if (this.tree.beforeSelect != null) {
                            if (this.tree.beforeSelect.data.text == node.data.text) {
                                this.tree.beforeSelect.set('checked', true);
                                node.set('checked', node.data.checked);
                            } else {
                                this.tree.beforeSelect.set('checked', false);
                                node.set('checked', !node.data.checked);
                            }
                        }
                        this.tree.beforeSelect = node;
                    }

                    if(node.data.depth > 0){
                        this.setParentState(node, checked);
                    }

                    if(checked === false){
                        this.allCheckbox.stopFlag = true;
                        this.allCheckbox.setValue(false);
                        this.allCheckbox.stopFlag = false;
                    }
                    else if(checked === true){
                        this.allCheckbox.setValue(this.setRefreshCheckBoxState());
                    }

                    this.setAllCheck(node, checked);
                }.bind(this)
            }
        });

        this.selectAgentArea = Ext.create('Exem.FieldContainer', {
            width : 250,
            height: 20,
            defaultType : 'radiofield',
            layout      : 'hbox',
            items :
                [{
                    boxLabel    : common.Util.TR('Host List'),
                    width       : 129,
                    name        : this.id + '_agent_list',
                    checked     : true,
                    listeners   : {
                        change  : function(me){
                            var ix,ixLen,jx,jxLen,
                                hostList, wasList,groupName,wasId,wasType,
                                childCheckList;
                            var hostInfo = {};
                            var serverHostList;

                            serverHostList = Comm.hosts.concat(Comm.oldHosts);

                            for (ix = 0, ixLen = serverHostList.length; ix < ixLen; ix++) {
                                groupName = serverHostList[ix];
                                hostList = [];

                                if (Ext.isEmpty(groupName)) {
                                    continue;
                                }

                                for (jx = 0,jxLen = Comm.wasIdArr.length; jx < jxLen; jx++) {
                                    wasId = Comm.wasIdArr[jx];
                                    wasType = Comm.wasInfoObj[wasId].type;

                                    if(this.monitorType != 'E2E' && wasType !== this.monitorType) {
                                        continue;
                                    }

                                    if (groupName === Comm.RTComm.getGroupNameByType(0, wasId)) {
                                        wasList = [];
                                        wasList.push(wasId + '', Comm.wasInfoObj[wasId].wasName);

                                        hostList.push(wasList);
                                    }
                                }

                                // Auto Scale 기능이 활성화된 경우 모니터링을 했었던 서버 정보도 설정
                                for (jx = 0,jxLen = Comm.oldServerIdArr.length; jx < jxLen; jx++) {
                                    if (this.monitorType !== 'WAS') {
                                        continue;
                                    }

                                    wasId = Comm.oldServerIdArr[jx];

                                    if (groupName === Comm.RTComm.getGroupNameByType(0, wasId)) {
                                        hostList.push([wasId + '', Comm.oldServerInfo[wasId].wasName]);
                                    }
                                }

                                if (hostList.length) {
                                    hostInfo[groupName] = hostList;
                                }

                            }


                            if (me.getValue()) {
                                childCheckList = this.childCheckList();
                                this.allCheckbox.setValue(false);
                                this.treeData = hostInfo;
                                this.getTreeStore(this.tree, childCheckList);


                                this.parentCheck(childCheckList);
                            }
                        }.bind(this)
                    }
                }, {
                    boxLabel    : common.Util.TR('Business List'),
                    width       : 129,
                    name        : this.id + '_agent_list',
                    hidden      : !this.isBizGrpList,
                    listeners   : {
                        change  : function(me){
                            if (me.getValue()){
                                var childCheckList = this.childCheckList();
                                this.allCheckbox.setValue(false);
                                this.treeData = Comm.bizGroupWasNamePairObj;
                                this.getTreeStore(this.tree, childCheckList);

                                this.parentCheck(childCheckList);
                            }
                        }.bind(this)
                    }
                }]
        });

        var findArea = Ext.create('Ext.container.Container', {
            width : 250,
            height: 30,
            layout: 'hbox'
        });


        findArea.add(this.findCombo, this.allCheckbox);
        this.add(this.selectAgentArea,  findArea, this.tree);
    },

    setTreeCombo: function() {
        if(!this.treeData) {
            var ix, ixLen, jx,jxLen,
                hostList, wasList,groupName,wasId, wasType;
            var hostInfo = {};
            var serverHostList;

            serverHostList = Comm.hosts.concat(Comm.oldHosts);

            for (ix = 0, ixLen = serverHostList.length; ix < ixLen; ix++) {
                groupName = serverHostList[ix];
                hostList = [];

                if (Ext.isEmpty(groupName)) {
                    continue;
                }

                for (jx = 0,jxLen = Comm.wasIdArr.length; jx < jxLen; jx++) {
                    wasId = Comm.wasIdArr[jx];
                    wasType = Comm.wasInfoObj[wasId].type;

                    if(this.monitorType != 'E2E' && wasType !== this.monitorType) {
                        continue;
                    }


                    if (groupName === Comm.RTComm.getGroupNameByType(0, wasId)) {
                        wasList = [];
                        wasList.push(wasId + '', Comm.wasInfoObj[wasId].wasName);

                        hostList.push(wasList);
                    }
                }

                // Auto Scale 기능이 활성화된 경우 Scaling Out 된 서버 정보도 설정
                for (jx = 0,jxLen = Comm.oldServerIdArr.length; jx < jxLen; jx++) {
                    if (this.monitorType !== 'WAS') {
                        continue;
                    }

                    wasId = Comm.oldServerIdArr[jx];

                    if (groupName === Comm.RTComm.getGroupNameByType(0, wasId)) {
                        hostList.push([wasId + '', Comm.oldServerInfo[wasId].wasName]);
                    }
                }

                if(hostList.length) {
                    hostInfo[groupName] = hostList;
                }

            }

            this.treeData = hostInfo;
            this.getTreeStore(this.tree, this.childCheckList());
        }

        if(this.findCombo){
            var comboValueList;
            var count = 0;
            var rawValues;
            this.findCombo.setSearchField('name');

            if(this.comboType === 'business'){
                comboValueList = this.findCombo.getRawValue().split(',');
            }
            else{
                comboValueList = this.findCombo.getValue();
                if(!comboValueList){
                    comboValueList = [];
                    rawValues = this.findCombo.getRawValue();
                    rawValues = rawValues.replace(/\s/gi, '').split(',');
                    for(ix = 0, ixLen = rawValues.length; ix < ixLen; ix++){
                        wasId = common.Util.getWasIdbyName(rawValues[ix]);
                        if(wasId){
                            comboValueList.push(wasId);
                        }
                    }
                }
            }

            this.tree.getRootNode().cascadeBy(function(n){
                if(comboValueList.length == 1 && comboValueList[0] == '(All)') {
                    n.set('checked', true);
                    count = this.tree.getRootNode().childNodes.length;
                }
                else {
                    if(n.id == 'root'){
                        this.allCheckbox.setValue(false) ;
                    }
                    else if(n.id != 'root' && n.data.leaf){
                        var nodeValue;

                        if(this.comboType == 'business'){
                            nodeValue = n.data.text;
                        }
                        else{
                            nodeValue = n.id;
                        }

                        if(comboValueList.indexOf(nodeValue) != -1){
                            n.set('checked', true);
                            this.setParentState(n, true);
                            if(n.parentNode.data.checked){
                                count += 1 ;
                            }
                        } else {
                            n.set('checked', false);
                            n.parentNode.set('checked', false);
                        }
                    }
                }
            }.bind(this));

            if ( count ==  this.tree.getRootNode().childNodes.length ){
                this.allCheckbox.setValue(true) ;
            }
        }
        else{
            this.allCheckbox.setValue(false) ;
        }

        if(this.selectedAgentList){
            for(ix = 0, ixLen = this.selectedAgentList.length; ix < ixLen; ix++){
                this.selectChkAgent(this.selectedAgentList[ix]);
            }
        }
    },

    selectChkAgent: function (agentName) {
        var treeRoot = this.tree.getRootNode();
        var chkFlag;
        treeRoot.cascadeBy(function (_node) {
            if (_node.internalId != 'root' && _node.data.depth == 2 && _node.data.text == agentName) {
                chkFlag = _node.getData().checked;
                _node.set('checked', !chkFlag);
                _node.parentNode.set('checked', this.setParentState(_node.parentNode, false));
                this.tree.getSelectionModel().select(_node);
            }
        }.bind(this));
    },

    childCheckList : function(){
        var ix,ixLen;
        var self = this;
        var childCheckList = [];

        for(ix = 0,ixLen = self.tree.getChecked().length; ix < ixLen; ix++ ){
            if(self.tree.getChecked()[ix].childNodes.length === 0){
                childCheckList.push(self.tree.getChecked()[ix].id);
            }
        }

        return childCheckList;
    },

    parentCheck : function(childCheckList){
        var ix,ixLen,jx,jxLen;
        var index = 0;
        var self = this;
        var parentNode = self.tree.getRootNode().data.children;
        var allCheck = [];

        if ( parentNode.length > 0 ) {
            for (ix = 0, ixLen = parentNode.length; ix < ixLen; ix++) {

                var parentDataCheck = [];
                for(jx = 0, jxLen = parentNode[ix].children.length; jx< jxLen; jx++){
                    parentDataCheck.push(childCheckList.indexOf(parentNode[ix].children[jx].id));
                }

                if(parentDataCheck.indexOf(-1) == -1){
                    self.tree.getView().getSelectionModel().select(index);
                    self.tree.fireEvent('checkchange', self.tree.getSelectionModel().getLastSelected(), true);
                    allCheck.push(self.tree.getSelectionModel().getLastSelected().data.checked);
                }
                index++;
                index = index + parentNode[ix].children.length;
            }
            if(allCheck.length === parentNode.length){
                self.allCheckbox.setValue(true);
            }
        }
    },

    setAllCheck: function(node, checkstate) {
        node.cascadeBy(function(_node){
            _node.set("checked",checkstate);
        });
    },

    getTreeStore: function(tree,checkList) {
        var ix, ixLen, jx, jxLen;
        var key, keyList, name, flag;
        var node = {};
        var child = {};
        var root = {
            text    : 'root',
            expanded: true,
            children: []
        };
        var serverType;

        if(this.comboType == 'sap'){
            this.allCheckbox.setValue(false) ;
        }

        keyList = Object.keys(this.treeData);
        if ( keyList.length > 0 ) {
            for (ix = 0, ixLen = keyList.length; ix < ixLen; ix++) {
                key = keyList[ix];
                flag = false;

                if(this.comboType == 'sap' && keyList[ix] == 'top'){
                    continue ;
                }

                node = {
                    id   : key,
                    text : key,
                    expanded: true,
                    checked: flag,
                    children: []
                };

                if(this.comboType == 'business') {
                    node.id = this.treeData[key].id;

                    if(this.treeData[key].child.length > 0){
                        this.addChildTree(node, this.treeData[key].child);
                    }
                    else{
                        node.leaf = true;
                        node.expanded = false;
                    }
                }
                else if (this.treeData[keyList[ix]].length != 0) {
                    for(jx = 0, jxLen = this.treeData[keyList[ix]].length; jx < jxLen; jx++ ){
                        name = this.treeData[keyList[ix]][jx];
                        if(checkList){
                            flag = false;
                            for(var kx = 0, kxLen = checkList.length; kx < kxLen; kx++){
                                if(checkList[kx] == name[0] ){
                                    flag = true;
                                }
                            }
                        } else {
                            flag = true;
                        }

                        if(this.comboType == 'sap'){
                            //check valid 1
                            if ( Comm.web_env_info['sap_type'] !== undefined && Comm.web_env_info['sap_type'].length !== 0 )
                            {
                                if ( Comm.web_env_info['sap_type'] == 'All' ){
                                    this.allCheckbox.setValue( true ) ;
                                    flag = true ;
                                }
                                else if ( Comm.web_env_info['sap_type'].indexOf(name[1]) == -1 ){
                                    flag = false ;
                                    node.checked = false ;
                                }
                            }
                            else{
                                //check valid 2
                                if (  name[2] !== 'WP'  )
                                {
                                    flag = false;
                                    node.checked = false;
                                }
                            }
                        }

                        child = {
                            id   : name[0],
                            text : name[1],
                            leaf : true,
                            expanded: true,
                            checked: flag,
                            children: []
                        };
                        serverType = Comm.RTComm.getServerTypeById(name[0]);

                        if (this.monitorType != 'E2E' && serverType == this.monitorType) {
                            node.children.push(child);
                        }
                    }
                }
                if(this.comboType == 'business' || node.children.length) {
                    root.children.push(node);
                }
            }
            tree.setRootNode(root);
        }

        if(this.comboType == 'sap'){
            this.okBtnClick();
        }

        child = null;
        node = null;
        root = null;
    },

    createDataList: function () {
        var root = {
            expanded: true,
            children: []
        };
        var mergeInfoObj = {};

        // Auto Scale 기능이 활성화된 경우 Scaling Out 된 서버 정보도 설정
        Ext.Object.merge(mergeInfoObj, Comm.wasInfoObj, Comm.oldServerInfo);

        if (Object.keys(mergeInfoObj).length > 0) {
            var parent = null;
            var isSame, count, hostName;
            var ix, ixLen, jx, jxLen;
            var keys = Object.keys(mergeInfoObj || {});
            var serverType;

            for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
                isSame = false;
                count = root.children.length;
                hostName = this.getGroupName(keys[ix]);
                if(!hostName){
                    continue;
                }

                if (count !== 0) {
                    for (jx = 0, jxLen = root.children.length; jx < jxLen; jx++) {
                        isSame = false;
                        if (hostName === root.children[jx].text) {
                            isSame = true;
                            parent = root.children[jx];
                            break;
                        }
                    }
                }

                if (!isSame) {
                    var node = {
                        agentId: keys[ix],
                        text: hostName,
                        expanded: true,
                        checked: false,
                        children: []
                    };

                    if (this.singleInstance) {
                        delete node.checked;
                    }

                    serverType = Comm.RTComm.getServerTypeById(node.agentId);
                    if (this.monitorType != 'E2E' && serverType == this.monitorType) {
                        root.children.push(node);
                        parent = root.children[root.children.length - 1];
                    }
                }

                var child = {
                    agentId: keys[ix],
                    text: Comm.RTComm.getServerNameByID(keys[ix]),
                    leaf: true,
                    expanded: true,
                    checked: false,
                    children: []
                };

                serverType = Comm.RTComm.getServerTypeById(child.agentId);
                if (this.monitorType != 'E2E' && serverType == this.monitorType) {
                    parent.children.push(child);
                    this.findComboData.push({name: child.text, value: child.agentId });
                }
            }

            this.findCombo.setData(this.findComboData);
        }
        return root;
    },

    setParentState: function (node, checkstate) {
        var count = 0;
        node.cascadeBy(function (child) {
            if (child.data.depth == 2 && child.data.checked == checkstate) {
                count++;
            }
        });
        return count === 0 ? true : false;
    },

    getGroupName: function(wasId){
        var groupName;

        if(this.isBusinessDaily || this.isBusinessMonthly){
            groupName = Comm.RTComm.getGroupNameByWasId(wasId);
        }
        else{
            groupName = Comm.RTComm.HostRelWAS(wasId);
        }

        return groupName;
    },

    setRefreshCheckBoxState : function() {
        var count = 0;

        this.tree.getRootNode().cascadeBy(function(child){
            if(child.data.depth == 1 && !child.data.checked){
                count++;
            }
        });

        return count == 0 ? true : false;
    }


});
