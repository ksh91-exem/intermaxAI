/**
 * Created by JONGHO on 14. 4. 25.
 */
Ext.define("Exem.adminTree", {
    extend  : 'Ext.container.Container',
    width   : '100%',
    height  : '100%',
    layout  : 'border',

    useCheckBox  : true,                // 그리드 가장 좌측에 체크박스가 생길것인지.
    rowNumber    : false,                // 그리드 가장 좌측에 Row number를 보일 것인지.
    localeType   : 'Y-m-d H:i:s',       // 그리드 시간값을 표시할 type
    defaultHeaderHeight: null,          // 컬럼의 한칸 기본 높이 설정.
    stripeRows   : true,                // 컬럼 줄무늬 보인지 설정
    itemclick    : null,                // 클릭 이벤트
    cellclick    : null,
    baseCls      : null,

    useEmptyText : false,
    emptyTextMsg : common.Util.TR('Information does not exist in your current item requests') + '.',

    constructor: function(config) {
        this.superclass.constructor.call(this, config);
        this._initEnvironment();
    },

    _initEnvironment: function() {
        var self = this;
        self._fieldList = [];
        self._columns = [];

        self.treeIndex = 0;

        this._nodeJsonData = {
            text    : 'root',
            expanded: true,
            children: [],
            childNodes : [],
            parentNode : []
        };

        if (self.rowNumber) {
            self._columns.push({
                xtype: 'rownumberer',
                renderer: function (v, p, record, rowIndex) {
                    return rowIndex + 1;
            }});
        }
    },

    addColumn: function(params) {
        var self = this;

        var _columnType = 'gridcolumn';
        var _cellEditor = null;
        var _dataAlign  = null;
        var readOnly    = (params.alowEdit)? params.alowEdit : false;
        var editMode    = (params.editMode)? params.editMode : false;
        var hide        = (params.hide)?     params.hide     : false;
        var hideable    = (params.hideable == null)? true : params.hideable;
        var renderer    = params.renderer || null;

        switch(params.type) {
            case Grid.Number:
            case Grid.Float:
            case Grid.StringNumber:
                _dataAlign = 'right';
                if (editMode) {
                    _cellEditor = { xtype: 'numberfield', readOnly: !readOnly };
                }
                break;

            case Grid.String:
                _dataAlign = 'left';
                if (editMode) {
                    _cellEditor = { xtype: 'textfield', readOnly: !readOnly };
                }
                break;

            case Grid.DateTime:
                _dataAlign = 'left';
                if (editMode) {
                    _cellEditor = { xtype: 'datefield', readOnly: !readOnly , format: self.localeType};
                }
                break;

            case Grid.CheckBox:
                _dataAlign = 'center';
                _columnType = 'checkcolumn';
                break;

            case Grid.tree:
                _dataAlign = 'left';
                _columnType = 'treecolumn';
                if (editMode) {
                    _cellEditor = { xtype: 'textfield', readOnly: !readOnly };
                }
                break;

            case Grid.Button:
                _dataAlign = 'left';
                _columnType = 'widgetcolumn';
                break;

            case Grid.Toggle:
                _dataAlign = 'left';
                _columnType = 'widgetcolumn';
                break;

            default:
                break;
        }

        var column = {
            xtype    : _columnType,
            width    : params.width,
            text     : params.text,
            height   : self.defaultHeaderHeight,
            align    : _dataAlign,
            dataIndex: params.dataIndex,
            hidden   : hide,
            hideable : hideable,
            editor   : _cellEditor,
            renderer : renderer
        };

        if (params.type == Grid.Button) {
            column.widget = {
                xtype: 'button',
                text: params.text,
                defaultBindProperty: null  //important
            };
            column.onWidgetAttach = params.widget.widgetAttach;
        }

        if (params.type == Grid.Toggle) {
            column.widget = {
                xtype: 'toggleslide',
                onText: params.widget.onText  || 'On',
                offText: params.widget.offText || 'Off',
                defaultBindProperty: null, //important
                stopSelection: false
            };
            column.resizable = false;
            column.onWidgetAttach = params.widget.widgetAttach;
        }

        self._columns.push(column);
        self._fieldList.push(params.dataIndex);

        params = null;
    },

    beginAddColumns: function() {

    },

    endAddColumns: function() {
        var self = this;
        self.baseStore = Ext.create('Ext.data.TreeStore',{
            fields:self._fieldList,
            root: {
                text    : 'root',
                expanded: true,
                children: []
            }
        });


        self.baseTree = Ext.create('Ext.tree.Panel',{
            width: '100%',
            height: '100%',
            region:'center',
            rootVisible: false,
            viewConfig: {
                markDirty          : false,  // 좌상단 빨간 세모가 없어집니다.
                stripeRows         : self.stripeRows,
                enableTextSelection: true,
                getRowClass        : self.configRowClass
            },
            bufferedRenderer: (self.bufferedRenderer !== false),
            sortableColumns: (self.sortableColumns !== false),
            store: self.baseStore,
            columns:  self._columns,
            cls: this.baseCls,
            listeners: {
                checkchange: function( node, checked) {
                    if (self.useCheckBox === true) {
                        if (node.hasChildNodes()) {
                            node.cascadeBy(function(n) {
                                if (checked === true) {
                                    n.set('checked', true);
                                } else {
                                    n.set('checked', false);
                                }
                            });
                        } else {
                            if (checked === false) {
                                node.parentNode.set('checked', false);
                            } else {
                                // 차일드가 true이면 전체가 true일 경우,. parent도 체크해주고, 아닌 경우에는 node만 true로 해주기.
                                var count = 0;
                                node.parentNode.cascadeBy(function(n) {
                                    if (n.data.checked === false && n.hasChildNodes() === false) {
                                        count++;
                                    }
                                });
                                // 모두 true인 경우에는 true로 설정
                                if(count == 0) {
                                    node.parentNode.set('checked', true);
                                }
                            }
                        }
                    }
                },
                itemclick: function(dv, record, item, index, e) {
                    if (self.itemclick != null) {
                        self.itemclick(dv, record, item, index, e);
                    }
                },
                cellclick: function( thisGrid, td, cellIndex, record, tr, rowIndex, e, eOpts ) {
                    if (self.cellclick != null) {
                        self.cellclick(thisGrid, td, cellIndex, record, tr, rowIndex, e, eOpts);
                    }
                }
            }
        });

        self.add(self.baseTree);
    },

    _getNodeFormat: function(nodedata) {
          var self = this;
          var nodeObj = {};

          for (var ix =0; ix < self._fieldList.length; ix++ ) {
              nodeObj[self._fieldList[ix]] = nodedata[ix];
              nodeObj.expanded = true;
              nodeObj.children = [];
              nodeObj.childNodes = [];
              nodeObj.parentNode = [];
              nodeObj.id = self.treeIndex++;

              if (self.useCheckBox === true) {
                  nodeObj.checked = true;
              }
          }
          return nodeObj;
    },

    drawTree: function() {
        this.baseTree.suspendEvents();

        this.baseTree.store.setRootNode(this._nodeJsonData);

        this._nodeJsonData = null;
        this._nodeJsonData = this.baseTree.store.getRootNode();

        this.baseTree.resumeEvents(true);
    },

    addNode: function(parentNode, nodeData) {
        var node = this._getNodeFormat(nodeData);

        this.baseTree.store.beginUpdate();

        if (parentNode == null || parentNode == 'undefined') {
            this._nodeJsonData.children.push(node);
            this._nodeJsonData.childNodes.push(node);

        } else if (parentNode != null) {
            node.parentNode.push(parentNode);
            parentNode.children.push(node);
            parentNode.childNodes.push(node);
        }
        this.baseTree.store.endUpdate();

        try {
            return node;
        } finally {
            node = null;
        }
    },

    clearNodes: function() {
        if ( !this.baseTree.store || !this.baseTree.store.getRootNode()) {
            return;
        }
        this.baseTree.bufferedRenderer.bodyTop = 0;
        this.baseTree.suspendEvents();
        this.baseTree.store.suspendEvents();

        this._nodeJsonData = null;
        this._nodeJsonData = {
            text       : 'root',
            expanded   : true,
            children   : [],
            childNodes : [],
            parentNode : []
        };

        this.baseTree.store.getRootNode().removeAll();
        this.baseTree.getView().refresh();

        this.baseTree.store.resumeEvents();
        this.baseTree.resumeEvents();
    },

    getNodeCount: function() {
        var self = this;
        return self.baseStore.getTotalCount();
    },

    findNode: function(fieldName, compareStr, node) {
        if ( !this.baseTree.store || !this.baseTree.store.getRootNode()) {
            return null;
        }

        var childNodes = null;
        try {

            if (node == undefined || node == null) {
                childNodes =  this._nodeJsonData.childNodes;
            } else {
                childNodes = node.childNodes;
            }

            return this.searchNode(fieldName , compareStr, childNodes);
        } finally {
            fieldName  = null;
            compareStr = null;
            node       = null;
            childNodes = null;
        }
    },

    searchNode : function(fieldName , compareStr, childNodes) {
        var result = null;
        var ix     = null;
        var nodeData;
        try {
            for (ix = 0; ix < childNodes.length; ix++) {
                nodeData = childNodes[ix].get(fieldName);
                if (nodeData && nodeData == compareStr) {
                    result = childNodes[ix];
                    break;
                }
                else {
                    if (childNodes[ix].childNodes.length > 0) {
                        result =  this.searchNode(fieldName , compareStr, childNodes[ix].childNodes);
                        if (result) {
                            break;
                        }
                    }
                }
            }
            return result;
        } finally {
            ix = null;
            fieldName  = null;
            compareStr = null;
            childNodes = null;
            result     = null;
        }

    },

    getCheckedRows: function () {
        var self = this;
        var rootNode =  self.baseTree.getRootNode();
        var getObj = function(){
            return {
                'group': null,
                'instanceList': []
            };
        };
        var tempList = [];
        var tempData = null;
        rootNode.cascadeBy(function(n){
            if (n.internalId !== 'root' && n.data.checked === true) {
                if (n.data.depth == 1) {
                    var data = getObj();
                    data['group'] = n.data;
                    tempList.push(data);
                    tempData = data;
                }
                if (n.data.depth == 2 && tempData) {
                    tempData['instanceList'].push(n.data);
                }
            }
        });

        return tempList;
    },

    showEmptyText: function() {
        if (this.useEmptyText  === false) {
            return;
        }

        this.baseTree.getView().emptyText = '<div class="x-grid-empty">'+this.emptyTextMsg+'</div>';
        this.baseTree.getView().refresh();
    },

    getSelectedRow: function() {
        return this.baseTree.getSelectionModel().getSelection();
    },

    selectRow: function(index, mode) {
        var self = this;
        // mode 가 true인 경우 select를 유지한다.
        var isKeep = (mode)? mode : false;

        var node =  self.baseStore.getAt(index);
        self.baseTree.getSelectionModel().select(node, isKeep);

        return node;
    },

    getNode: function(index) {
        var self = this;
        return self.baseStore.getAt(index);
    },

    updateCell: function(field, index, data) {
        var self = this;
        var row =  self.baseStore.getAt(index);
        row.set(field, data);
    },

    findRow: function(fieldName, value) {
        var self = this;
        //findRecord( fieldName, value, [startIndex], [anyMatch], [caseSensitive], [exactMatch] )
        // startIndex    : 검색 위치
        // anyMatch      : 부분일치 여부
        // caseSensitive : 대소문자 구분 여부
        // exactMatch    : 정확히 일치 여부      수정 2015-01-21 JH

        var row = self.baseStore.findRecord(fieldName, value, 0, false, false , true);
        return row;
    }
});

