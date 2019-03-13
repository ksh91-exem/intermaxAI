Ext.define("Exem.TreeWindow", {
    extend: 'Ext.container.Container',
    layout: 'fit',
    title: null,
    comboType: 'was',
    treeData: null,
    connectComboBox: null,
    monitorType: null,

    constructor: function() {
        this.callParent(arguments);

        if(!this.monitorType) {
            this.monitorType = window.rtmMonitorType;
        }
    },

    init: function(){
        var self = this;
        var imgSrc = '../images/wasForm.png';

        if(Comm.rtmShow && Comm.RTComm.getCurrentTheme()){
            imgSrc = '../images/wasForm_Gray.png';
        }

        var findIcon = Ext.create('Ext.Img', {
            src   : imgSrc,
            margin: '3 0 0 5',
            style : {
                cursor: 'pointer'
            },
            listeners: {
                el: {
                    click: function() {
                        self.window.showBy(this, 'tl-bl');
                        if(self.isRTM && Comm.RTComm.getCurrentTheme() != 'White' ){
                            self.window.addCls('xm-treewindow-mode-rtm');
                        }
                    }
                }
            }
        });

        self.AllCheckbox = Ext.create('Ext.form.field.Checkbox',{
            boxLabel: 'All',
            checked : true,
            margin  : '0 0 0 10',
            stopFlag: false,
            listeners: {
                change: function() {
                    if (this.AllCheckbox.stopFlag === false) {
                        if (this.AllCheckbox.getValue() === false) {
                            this.setAllCheck(self.tree.getRootNode(), false);
                        } else {
                            this.setAllCheck(self.tree.getRootNode(), true);
                        }
                    }
                }.bind(this)
            }
        });

        var treeStore = Ext.create('Ext.data.TreeStore',{
            root: {
                text    : 'root',
                expanded: true,
                children: []
            }
        });
        self.tree = Ext.create('Ext.tree.Panel', {
            width: '100%',
            height: '100%',
            flex  : 1,
            rootVisible: false,
            store: treeStore,
            autoHeight: true,
            //autoScroll:true,
            cls  : 'list-condition-tree',
            listeners: {
                checkchange : function(node,check) {
                    if(node.data.depth > 0){
                        this.setParentState(node, check);
                    }

                    if(check === false){
                        this.AllCheckbox.stopFlag = true;
                        this.AllCheckbox.setValue(false);
                        this.AllCheckbox.stopFlag = false;
                    }
                    else if(check === true){
                        this.AllCheckbox.setValue(this.setRefreshCheckBoxState());
                    }

                    this.setAllCheck(node, check);
                }.bind(this)
            }
        });
        self.getTreeStore(self.tree);

        self.window = Ext.create('Exem.XMWindow',{
            width      : 300,
            height     : 450,
            maximizable: false,
            title      : common.Util.TR(self.title),
            closeAction: 'hide',
            layout     : 'fit',
            draggable  : false,
            //cls        : 'Exem-TreeWindow-treeWindow',
            style      : 'background : #ffffff !important; borderRadius : 6px;',
            listeners  : {
                show: function() {
                    if(this.connectComboBox){
                        var comboValueList;
                        var count = 0;
                        var rawValues;
                        var wasId;

                        if(this.comboType === 'business'){
                            comboValueList = this.connectComboBox.getRawValue().split(',');
                        }
                        else{
                            comboValueList = this.connectComboBox.getValue();
                            if(!comboValueList){
                                comboValueList = [];
                                rawValues = this.connectComboBox.getRawValue();
                                rawValues = rawValues.replace(/\s/gi, '').split(',');
                                for(var ix = 0, ixLen = rawValues.length; ix < ixLen; ix++){
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
                                    this.AllCheckbox.setValue(false) ;
                                }
                                else if(n.id != 'root' && n.data.leaf){
                                    var nodeValue;

                                    if(this.comboType == 'business'){
                                        nodeValue = n.data.text;
                                    }
                                    else{
                                        nodeValue = n.id;
                                    }

                                    if(typeof nodeValue === 'number'){
                                        nodeValue = String(nodeValue);
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

                        if ( count && count == this.tree.getRootNode().childNodes.length ){
                            self.AllCheckbox.setValue(true) ;
                        }
                    }
                    else{
                        self.AllCheckbox.setValue(false) ;
                    }
                }.bind(this),

                hide: function(){
                    this.tree.getRootNode().cascadeBy(function(n){
                        n.set('checked', false);
                    }.bind(this));
                }.bind(this)
            }
        });

        var contentCon = Ext.create('Exem.Container', {
            width : '100%',
            flex  : 1,
            padding: 10,
            layout : 'vbox',
            cls : 'Exem-TreeWindow-contentCon'
        });

        var dashboardCheck = false;

        if(Comm.isWooriDash){
            dashboardCheck = true;
        }

        self.topArea = Ext.create('Exem.FieldContainer', {
            width : '100%',
            height: 25,
            defaultType : 'radiofield',
            layout      : 'hbox',
            items : [
                {
                    boxLabel    : common.Util.TR('Host List'),
                    width       : 129,
                    name        : self.id + '_agent_list',
                    checked     : !dashboardCheck,
                    hidden      : dashboardCheck,
                    listeners   : {
                        change  : function(){
                            if(self.comboType == 'business'){
                                return;
                            }

                            var ix,ixLen,jx,jxLen,
                                hostArr, hostList, wasList,groupName,wasId,groupVal,
                                childCheckList;
                            var hostInfo = {};

                            // Auto Scale 처리된 호스트 정보도 설정이 되도록 처리함.
                            hostArr = self.monitorType === 'WEB' ? Comm.webHosts : Comm.hosts.concat(Comm.oldHosts);
                            for (ix = 0, ixLen = hostArr.length; ix < ixLen; ix++) {
                                groupName = hostArr[ix];
                                hostList = [];

                                if (Ext.isEmpty(groupName)) {
                                    continue;
                                }

                                for (jx = 0,jxLen = Comm.wasIdArr.length; jx < jxLen; jx++) {
                                    wasId = self.agentIdArr[jx];
                                    groupVal = self.monitorType === 'WEB' ?  Comm.RTComm.getWebGroupNameByType(0, wasId) : Comm.RTComm.getGroupNameByType(0, wasId);

                                    if (groupName === groupVal) {
                                        wasList = [];
                                        wasList.push(wasId + '', self.agentInfo[wasId].name || self.agentInfo[wasId].wasName);

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


                            if (this.getValue()) {
                                childCheckList = self.childCheckList();
                                self.AllCheckbox.setValue(false);
                                self.treeData = hostInfo;
                                self.getTreeStore(self.tree, childCheckList);


                                self.parentCheck(childCheckList);
                            }
                        }
                    }
                }, {
                    boxLabel    : common.Util.TR('Business List'),
                    width       : 129,
                    name        : self.id + '_agent_list',
                    checked     : dashboardCheck,
                    hidden      : !this.businessListCheck,
                    listeners   : {
                        change  : function(){
                            if(self.comboType == 'business'){
                                return;
                            }

                            if (this.getValue()){
                                var childCheckList;
                                childCheckList = self.childCheckList();
                                self.AllCheckbox.setValue(false);
                                self.treeData = Comm.bizGroupWasNamePairObj;
                                self.getTreeStore(self.tree, childCheckList);


                                self.parentCheck(childCheckList);
                            }
                        }
                    }
                }]
        });

        var okBtn = Ext.create('Ext.container.Container',{
            html   : common.Util.TR('OK'),
            height : 23,
            width  : 55,
            cls    : 'stat_change_b',
            listeners: {
                render: function() {
                    this.getEl().on('click', function() {
                        self.okBtnClick() ;
                    });
                }
            }
        });

        var bottomArea = Ext.create('Exem.Container', {
            width : '100%',
            margin: '8 0 0 0',
            height: 23,
            layout: {
                type : 'hbox',
                align: 'middle',
                pack: 'center'
            },
            cls : 'Exem-TreeWindow-bottomArea',
            items : [ okBtn ]
        });

        if(this.comboType == 'business') {
            contentCon.add( self.AllCheckbox, self.tree, bottomArea ) ;
        } else{
            contentCon.add( self.topArea, self.AllCheckbox, self.tree, bottomArea ) ;
        }
        self.window.add( contentCon );
        self.add(findIcon);
    },

    addChildTree: function(parent, treeData){
        var ix, ixLen;
        var node = {};

        for (ix = 0, ixLen = treeData.length; ix < ixLen; ix++) {
            node = {
                id: treeData[ix].id,
                text: treeData[ix].name,
                expanded: true,
                checked: true,
                children: []
            };

            if(treeData[ix].child.length > 0){
                this.addChildTree(node, treeData[ix].child);
            }
            else {
                node.leaf = true;
                node.expanded = false;
            }

            parent.children.push(node);
        }
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

        if(this.comboType == 'sap'){
            this.AllCheckbox.setValue(false) ;
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
                                    this.AllCheckbox.setValue( true ) ;
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
                        if(this.monitorType !== 'E2E' && this.agentInfo[name[0]]) {
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

    setRefreshCheckBoxState : function() {
        var count = 0;

        this.tree.getRootNode().cascadeBy(function(child){
            if(child.data.depth == 1 && !child.data.checked){
                count++;
            }
        });

        return count == 0 ? true : false;
    },

    setParentState : function(node, checkstate){
        var count = 0;
        node.parentNode.cascadeBy(function(child){
            if(node.data.depth == child.data.depth && child.data.checked == checkstate ){
                count++;
            }
        });

        if( ( count == node.parentNode.data.children.length && checkstate ) || ( count > 0 && !checkstate ) ){
            node.parentNode.set('checked', checkstate);
        }

        if(node.data.depth > 1){
            this.setParentState(node.parentNode, checkstate);
        }
    },

    setAllCheck: function(node, checkstate) {
        node.cascadeBy(function(_node){
            _node.set("checked",checkstate);
        });
    },

    okBtnClick: function(){
        var self = this ;

        if(this.comboType == 'business') {
            var checkedBusinessName = [];

            self.tree.getRootNode().cascadeBy(function(node) {
                if(node.data.checked) {
                    checkedBusinessName.push(node.data.text);
                }
            });

            if ( self.AllCheckbox.getValue() ) {
                self.connectComboBox.setValue('(All)');
            }
            else{
                self.connectComboBox.setValue(checkedBusinessName.join(','));
            }

            self.connectComboBox.checkedList = checkedBusinessName;
            self.window.close();
        }
        else{
            if ( self.AllCheckbox.getValue() && self.childCheckList().length == self.agentIdArr.length ) {
                // All 넘겨주기
                self.connectComboBox.reset();
                self.connectComboBox.select(self.connectComboBox.store.getAt(0));
                self.window.close();
            }
            else {
                var checkedWasNames = [];
                var checkedWasIds   = [];

                self.tree.getRootNode().cascadeBy(function(node) {
                    if (node.data.leaf && node.data.checked) {
                        checkedWasNames.push(node.data.text);
                        checkedWasIds.push(node.data.id);
                    }
                });

                if (checkedWasNames.length == 0) {
                    Ext.MessageBox.show({
                        title    : common.Util.TR('Warning'),
                        msg      : common.Util.TR('Please select WAS.'),
                        icon     : Ext.MessageBox.WARNING,
                        buttons  : Ext.MessageBox.OK
                    });
                } else {
                    var recordList = [];
                    for (var ix = 0; ix < checkedWasNames.length; ix++) {
                        recordList.push(self.connectComboBox.getStore().findRecord('name', checkedWasNames[ix]));
                    }
                    self.connectComboBox.select(recordList);
                    self.connectComboBox.nowSelectedValue = checkedWasIds.join();
                    self.window.close();

                    ix = null ;
                }
            }

            if(self.connectComboBox.onTreeWindoeSelect){
                self.connectComboBox.onTreeWindoeSelect();
            }


            /*
             * 1503.22 min
             * sap에서는 마지막 설정한 was를 기억해주도록 하라. by부사장님
             * */
            if ( Comm.sap['top'] ){

                common.WebEnv.del_config( 'sap_type' ) ;

                //all choice
                if ( self.AllCheckbox.getValue() ){
                    common.WebEnv.insert_config( 'sap_type', 'All' ) ;
                }else{ //was choice
                    common.WebEnv.insert_config( 'sap_type', checkedWasNames ) ;
                }

            }
        }
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
            if(allCheck.length && allCheck.length === parentNode.length){
                self.AllCheckbox.setValue(true);
            }
        }
    }
});
