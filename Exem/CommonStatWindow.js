/**
 * Created by jykim on 2017-07-11.
 */
Ext.define("Exem.CommonStatWindow", {
    extend: 'Exem.XMWindow',
    title: common.Util.TR('Stat Change'),
    layout: 'vbox',
    width: 300,
    height: 450,
    cls: 'Exem-CommonStatWindow',

    okFn: null,             // ok 버튼 클릭 시 사용될 콜백 함수
    addColumns: null,       // 성성된 그리드/트리의 컬럼 설정 시 사용될 콜백 함수
    isTree: false,
    useCancel: false,
    selectedList: null,

    tabInfo: null,         // tab 별 데이터
    activeTabIndex: 0,      // 초기 활성화 할 탭 인덱스
    comboDataIndex: 0,      // 그리드/트리에서 콤보박스 내 리스트 데이터로 설정할 컬럼 인덱스
    comboDataField: 'name', // 콤보박스에서 선택된 데이터 검색 시 사용할 값 (grid:dataIndex or tree:fieldName)

    init: function() {
        this.createLayout();
    },

    createGrid: function() {
        this.grid = Ext.create('Exem.BaseGrid', {
            width: '100%',
            cls: 'exem-statChange-grid',
            gridType: Grid.exGrid,
            hideGridHeader: this.hideGridHeader || false,
            usePager: this.usePager || false,
            useCheckbox: {
                use : true,
                mode: Grid.checkMode.SINGLE,
                headerCheck: false,
                checkOnly: false
            }
        });
    },

    createTree: function() {
        this.grid = Ext.create('Exem.adminTree', {
            width : '100%',
            editMode: false,
            checkMode: Grid.checkMode.MULTI,
            showHeaderCheckbox: false,
            rowNumber: false,
            baseCls: 'list-condition-tree'
        });
    },

    createBtn: function() {
        var btnCon = Ext.create('Exem.Container', {
            width : '100%',
            margin: '10 0 0 0',
            height: 25,
            layout: {
                type : 'hbox',
                align: 'middle',
                pack: 'center'
            },
            style : 'background: #ffffff'
        });

        var okBtn = Ext.create('Exem.Button',{
            text   : common.Util.TR('OK'),
            height : 25,
            width  : 55,
            margin : '0 5 0 0',
            cls    : 'stat_change_b',
            listeners: {
                scope: this,
                click: function() {
                    var treeItems,
                        selectedList,
                        item,
                        ix, ixLen;

                    if (this.isTree) {
                        treeItems = this.grid.baseStore.data.items;
                        selectedList = [];

                        for (ix = 0, ixLen = treeItems.length; ix < ixLen; ix++) {
                            item = treeItems[ix];
                            if (!item.childNodes.length && item.get('checked')) {
                                selectedList.push(item.get(this.comboDataField));
                            }
                        }
                    }
                    else {
                        selectedList = this.grid.getSelectedRow();
                    }

                    this.okFn(selectedList, this, this.connectChart);
                }
            }
        });

        if (this.useCancel) {
            var cancelBtn = Ext.create('Exem.Button',{
                html   : common.Util.TR('Cancel'),
                height : 25,
                width  : 55,
                margin : '0 5 0 0',
                cls    : 'stat_change_b',
                listeners: {
                    scope: this,
                    click: function() {
                        this.close();
                    }
                }
            });

            btnCon.add(okBtn,{ xtype:'tbspacer', width: 3 }, cancelBtn);
        }
        else {
            btnCon.add(okBtn);
        }

        this.add(btnCon);
    },

    createLayout: function() {
        var ix, ixLen, keys;

        this.tabPanel = Ext.create('Exem.TabPanel', {
            width: '100%',
            flex: 1,
            listeners: {
                scope: this,
                tabchange: function() {
                    this.tabPanel.setActiveTab(this.activeTabIndex);
                    this.tabPanel.getActiveTab().add(this.grid);
                    this.setData();
                }
            }
        });

        this.searchCombo = Ext.create('Exem.AjaxComboBox',{
            width: '100%',
            data: [],
            margin: '5 0 5 0',
            enableKeyEvents: true,
            useSelectFirstRow: false,
            findKey: this.comboDataField,
            listeners: {
                scope: this,
                select: function(me) {
                    var grid = this.grid,
                        node, value;

                    if (this.isTree) {
                        node = grid.findNode(me.findKey, me.getValue(), null);
                        if (node) {
                            value = !node.get('checked');
                            node.set('checked', value);
                            grid.baseTree.fireEvent('checkchange', node, value);
                        }
                    }
                    else {
                        grid._findColumns();
                    }
                }
            }
        });

        this.tabPanel.addDocked(this.searchCombo);

        keys = Object.keys(this.tabInfo);
        for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
            this.tabPanel.add(
                Ext.create('Exem.Container', {
                    width: '100%',
                    title : keys[ix]
                })
            );
        }

        this.add(this.tabPanel);

        if (this.isTree) {
            this.createTree();
        }
        else {
            this.createGrid();
        }

        this.addColumns(this.grid);
        this.createBtn();

        this.tabPanel.setActiveTab(0);
    },

    addChildNode: function(parent, data, comboData) {
        var grid = this.grid,
            ix, ixLen,
            rowData, node;

        for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
            rowData = data[ix];
            node = grid.addNode(parent, rowData.data);
            comboData.push({name: rowData.data[this.comboDataIndex], value: rowData.data[this.comboDataIndex]});
            if (rowData.child) {
                this.addChildNode(node, rowData.child);
            }
        }
    },

    setTreeData: function(data) {
        var grid = this.grid,
            rowData, node, comboData,
            ix, ixLen;

        comboData = [];
        for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
            rowData = data[ix];
            node = grid.addNode(null, rowData.data);
            if (rowData.child) {
                this.addChildNode(node, rowData.child, comboData);
            }
        }

        grid.drawTree();

        if(this.selectedList){
            this.selectTreeData(grid.baseTree, this.selectedList);
        }

        this.searchCombo.setData(comboData);
        this.searchCombo.setSearchField('name');
    },

    selectTreeData : function(tree, selectedList){
        var checkValue;

        for(var key in selectedList){
            if(typeof selectedList[key] !== 'string'){
                console.info('The data type is not a string.');
                return;
            }
        }

        tree.getRootNode().cascadeBy(function(node){
            if(!node.data.children.length){

                checkValue = selectedList.indexOf(node.data[this.comboDataField]) !== -1;

                node.set('checked', checkValue);
                tree.fireEvent('checkchange', node, checkValue);
            }
        }.bind(this));
    },

    setGridData: function(data) {
        var grid = this.grid,
            comboData = [],
            ix, ixLen;

        for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
            grid.addRow(data[ix]);
            comboData.push({name: data[ix][0], value: data[ix][1]});
        }

        grid.drawGrid();

        if (this.selectedList){
            grid.selectByValue(this.selectedList.dataIndex, this.selectedList.value);
        }

        this.searchCombo.setData(comboData);
        this.searchCombo.setSearchField('name');
    },

    setData: function() {
        var tab, data;

        tab = this.tabPanel.getActiveTab();
        data = this.tabInfo[tab.title];

        if (this.isTree) {
            this.setTreeData(data);
        }
        else {
            this.setGridData(data);
        }
    }
});