Ext.define("view.BusinessTxnSummary", {
    extend: "Exem.FormOnCondition",
    width: "100%",
    height: "100%",
    DisplayTime: DisplayTimeMode.None,
    sql: {
        businessInfo : 'IMXPA_BusinessTxnSummary_BizInfo.sql',
        businessTxnSummary : 'IMXPA_BusinessTxnSummary_Summary.sql'
    },

    checkValid: function(){
        var result = true;

        result = this.wasCombo.checkValid();
        if(result){
            if(!this.businessName.getRawValue()){
                result = false;
            }
        }

        return result;
    },

    init: function(){
        this.bizNameTreeData = {};
        this.bizNameList = [];

        this.setBusinessInfo();
    },

    makeLayout: function(){
        this.setWorkAreaLayout('border');

        this.createTopLayout();
        this.createBottomLayout();
    },

    createTopLayout: function(){
        this.wasCombo = Ext.create('Exem.wasDBComboBox', {
            width           : 370,
            comboLabelWidth : 60,
            comboWidth      : 310,
            selectType      : common.Util.TR('Agent'),
            multiSelect     : true,
            itemId          : 'wasCombo',
            x               : 375,
            y               : 5
        });

        this.avgElapseTime = Ext.create('Exem.NumberField', {
            fieldLabel: common.Util.CTR('Elapse Time (AVG) >='),
            labelWidth: 120,
            x: 745,
            y: 5,
            value: 0,
            width: 187,
            maxLength: 10,
            maxValue: 2147483647,
            minValue : 0,
            decimalPrecision: 3,
            allowBlank: false,
            allowExponential: false
        });

        this.businessName = Ext.create('Exem.TextField', {
            fieldLabel: common.Util.TR('Business Name'),
            itemId    : 'businessName',
            allowBlank: false,
            value     : '(All)',
            maxLength : 255,
            enforceMaxLength : true,
            width     : 350,
            x         : 340,
            y         : 30,
            readOnly  : true,
            validateOnBlur : false,
            checkedList : null
        });

        this.findIcon = Ext.create('Exem.TreeWindow', {
            x : 690,
            y : 30,
            width: 21,
            height: 19,
            title: common.Util.TR('Business Name'),
            comboType: 'business',
            treeData: this.bizNameTreeData,
            connectComboBox: this.businessName
        });

        this.findIcon.init();

        this.conditionArea.add(this.wasCombo, this.avgElapseTime, this.businessName, this.findIcon);
    },

    createBottomLayout: function(){
        var bottomArea = Ext.create('Exem.Container', {
            height : '100%',
            region : 'center',
            layout : 'fit',
            cls : 'view-BusinessTxnSummary-bottomArea'
        });

        this.summaryTree = Ext.create('Exem.BaseGrid', {
            useArrows : false,
            gridName : 'pa_business_transaction_summary',
            gridType : Grid.exTree,
            baseGridCls : 'call-tree-node-style'
        });

        this.summaryTree.beginAddColumns();
        this.summaryTree.addColumn('Business ID',                           'business_id',      120,    Grid.StringNumber, false, true);
        this.summaryTree.addColumn(common.Util.CTR('Business Name'),        'business_name',    350,    Grid.String, true, false, 'exemtreecolumn');
        this.summaryTree.addColumn(common.Util.CTR('Elapse Time (AVG)'),    'avg_elapse_time',  120,    Grid.Float, true, false);
        this.summaryTree.addColumn(common.Util.CTR('Elapse Time (MAX)'),    'max_elapse_time',  120,    Grid.Float, true, false);
        this.summaryTree.addColumn(common.Util.CTR('Execute Count'),         'execute_count',    120,    Grid.Number, true, false);
        this.summaryTree.addColumn(common.Util.CTR('Success Count'),        'success_count',    120,    Grid.Number, true, false);
        this.summaryTree.addColumn(common.Util.CTR('Failure Count'),        'failure_count',    120,    Grid.Number, true, false);
        this.summaryTree.addColumn(common.Util.CTR('Availability'),         'availability',     120,    Grid.Float, true, false);

        var  ratioRender =  function(value){
            return '<div style="position:relative; width:100%; height:13px">' +
                '<div data-qtip="' + value + '%'+'" style="float:left; background-color:#5898E9;height:100%;width:'+ value +'%;"></div>' +
                '<div style="position:absolute;width:100%;height:100%;text-align:center;">' + value.toFixed(1) + '%</div>' +
                '</div>';

        };

        this.summaryTree.addRenderer('availability', ratioRender, RendererType.bar) ;

        this.summaryTree.endAddColumns();
        this.summaryTree.loadLayout(this.summaryTree.gridName);

        bottomArea.add(this.summaryTree);
        this.workArea.add(bottomArea);
    },

    setBusinessInfo: function(){
        WS.SQLExec({
            sql_file: this.sql.businessInfo
        }, this.onBusinessInfoData, this);
    },

    addChildBusiness: function(data, parent_id){
        var ix, ixLen, jx, jxLen;
        var rowData, childRowData;
        var tempTreeData = [];
        var tempData;
        var isExistChild;

        try{
            for(ix = 0, ixLen = data.length; ix < ixLen; ix++){
                rowData = data[ix];
                if(rowData[2] == parent_id){
                    isExistChild = false;

                    for(jx = 0, jxLen = data.length; jx < jxLen; jx++){
                        childRowData = data[jx];
                        if(childRowData[2] == rowData[0]){
                            isExistChild = true;
                            break;
                        }
                    }

                    tempData = {};
                    tempData.id = rowData[0];
                    tempData.name = rowData[1];
                    tempData.child = [];

                    if(isExistChild){
                        tempData.child = this.addChildBusiness(data, rowData[0]);
                    }

                    tempTreeData.push(tempData);
                }
            }
        }
        catch(e){
            console.debug('BusinessTxnSummary-addChildBusiness');
            console.debug(e);
            console.debug('parent_id : ' + parent_id);
            console.debug(data);
        }

        return tempTreeData;
    },

    onBusinessInfoData: function(header, data){
        var ix, ixLen;
        var rowData;
        var tempData;

        if(!common.Util.checkSQLExecValid(header, data)){
            console.debug('BusinessTxnSummary-onBusinessInfoData');
            console.debug(header);
            console.debug(data);
            return;
        }

        for(ix = 0, ixLen = data.rows.length; ix < ixLen; ix++){
            rowData = data.rows[ix];
            if(rowData[2] == null){
                tempData = {};
                tempData.id = rowData[0];
                tempData.name = rowData[1];
                tempData.child = this.addChildBusiness(data.rows, rowData[0]);
                this.bizNameTreeData[rowData[1]] = tempData;
            }

            this.bizNameList.push(rowData[0]);
        }

        this.makeLayout();
    },

    checkParentNode: function(node){
        var currentNode = node;

        while(currentNode.data.id != 'root'){
            if(this.bizNameList.indexOf(currentNode.data.id) == -1){
                this.bizNameList.push(currentNode.data.id);
            }

            currentNode = currentNode.parentNode;
        }
    },

    getCheckedBusinessName: function(){
        var ix, ixLen;
        var searchStr;
        var checkedNode;
        var businessName;

        var getCheckNode = function(node){
            if(node.data.text == businessName) {
                checkedNode = node;
            }
        };

        if(this.businessName.checkedList){
            this.bizNameList = [];
            for(ix = 0, ixLen = this.businessName.checkedList.length; ix < ixLen; ix++){
                checkedNode = null;
                businessName = this.businessName.checkedList[ix];
                this.findIcon.tree.getRootNode().cascadeBy(getCheckNode);

                if(checkedNode){
                    this.checkParentNode(checkedNode);
                }
            }
        }

        searchStr = this.bizNameList.join(',');

        return searchStr;
    },

    executeSQL: function(){
        var dataSet = {};

        dataSet.sql_file = this.sql.businessTxnSummary;
        dataSet.bind = [{
            name : 'from_time',
            type : SQLBindType.STRING,
            value: this.datePicker.getFromDateTime() + ' 00:00:00'
        },{
            name : 'to_time',
            type : SQLBindType.STRING,
            value: this.datePicker.getToDateTime() + ' 23:59:59'
        },{
            name : 'txn_elapse_avg',
            type : SQLBindType.FLOAT,
            value: +this.avgElapseTime.getRawValue()
        }];

        dataSet.replace_string = [{
            name : 'wasIds',
            value: this.wasCombo.getValue()
        },{
            name : 'businessIds',
            value: this.getCheckedBusinessName()
        }];

        WS.SQLExec(dataSet, this.onBusinessSummaryData, this);
    },

    checkExistTreeData: function(data, business_id){
        var ix, ixLen;
        var index = -1;
        var summaryData, rowData;

        summaryData = data[1].rows;

        for(ix = 0, ixLen = summaryData.length; ix < ixLen; ix++){
            rowData = summaryData[ix];
            if(rowData[0] == business_id){
                index = ix;
                break;
            }
        }

        return index;
    },

    addChildNode: function(parentNode, parent_id, data){
        var ix, ixLen, jx, jxLen, index;
        var rowData, childRowData, treeData, summaryData, summaryRowData;
        var currentNode;
        var isExistChild;

        treeData = data[0].rows;

        try{
            for(ix = 0, ixLen = treeData.length; ix < ixLen; ix++){
                rowData = treeData[ix];
                if(rowData[2] == parent_id){
                    isExistChild = false;

                    for(jx = 0, jxLen = treeData.length; jx < jxLen; jx++){
                        childRowData = treeData[jx];
                        if(childRowData[2] == rowData[0]){
                            isExistChild = true;
                            break;
                        }
                    }

                    index = this.checkExistTreeData(data, rowData[0]);
                    if(index != -1){
                        summaryData = data[1].rows;
                        summaryRowData = summaryData[index];
                        currentNode = this.summaryTree.addNode(parentNode, [
                            summaryRowData[0],      //business_id
                            rowData[1],             //business_name
                            summaryRowData[1],      //avg_elapse_time
                            summaryRowData[2],      //max_elapse_time
                            summaryRowData[3],      //execute_count
                            summaryRowData[4],      //success_count
                            summaryRowData[5],      //failure_count
                            summaryRowData[6]       //availability
                        ]);

                        if(isExistChild){
                            this.addChildNode(currentNode, rowData[0], data);
                        }
                    }
                }
            }
        }
        catch(e){
            console.debug('BusinessTxnSummary-addChildNode');
            console.debug(e);
            console.debug(parentNode);
            console.debug('parent_id : ' + parent_id);
            console.debug(data);
        }
    },

    setTreeNode: function(data){
        var ix, ixLen, index;
        var rowData, treeData, summaryData, summaryRowData;
        var rootNode;

        treeData = data[0].rows;

        try{
            for (ix = 0, ixLen = treeData.length; ix < ixLen; ix++) {
                rowData = treeData[ix];
                if(rowData[2] == null){
                    index = this.checkExistTreeData(data, rowData[0]);
                    if(index != -1){
                        summaryData = data[1].rows;
                        summaryRowData = summaryData[index];
                        rootNode = this.summaryTree.addNode(null, [
                            summaryRowData[0],      //business_id
                            rowData[1],             //business_name
                            summaryRowData[1],      //avg_elapse_time
                            summaryRowData[2],      //max_elapse_time
                            summaryRowData[3],      //execute_count
                            summaryRowData[4],      //success_count
                            summaryRowData[5],      //failure_count
                            summaryRowData[6]       //availability
                        ]);

                        this.addChildNode(rootNode, rowData[0], data);
                    }
                }
            }
        }
        catch(e){
            console.debug('BusinessTxnSummary-setTreeNode');
            console.debug(e);
            console.debug(data);
        }
    },

    onBusinessSummaryData: function(header, data){
        if(!common.Util.checkSQLExecValid(header, data)){
            console.debug('BusinessTxnSummary-onBusinessSummaryData');
            console.debug(header);
            console.debug(data);
            return;
        }

        this.summaryTree.clearNodes();

        if(data[0].rows.length > 0 && data[1].rows.length > 0){
            this.summaryTree.beginTreeUpdate();
            this.setTreeNode(data);
            this.summaryTree.endTreeUpdate();
        }

        this.summaryTree.drawTree();
    }
});

