/**
 * Created by JONGHO on 14. 4. 25.
 */
Ext.define("Exem.simpleTree", {
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

    constructor: function(config) {
        this.superclass.constructor.call(this, config);
        this._initEnvironment();
    },

    _initEnvironment: function() {
        var self = this;
        self._fieldList = [];
        self._columns = [];

        self.treeIndex = 0;

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
        var _dataType   = null;
        var readOnly    = (params.alowEdit)? params.alowEdit : false;
        var editMode    = (params.editMode)? params.editMode : false;
        switch(params.type) {
            case Grid.Number:
                _dataAlign = 'right';
                _dataType = 'int';
                if (editMode) {
                    _cellEditor = { xtype: 'numberfield', readOnly: !readOnly };
                }

                break;
            case Grid.Float:
                _dataAlign = 'right';
                _dataType  = 'float';
                if (editMode) {
                    _cellEditor = { xtype: 'numberfield', readOnly: !readOnly };
                }

                break;
            case Grid.String:
                _dataAlign = 'left';
                _dataType  = 'string';
                if (editMode) {
                    _cellEditor = { xtype: 'textfield', readOnly: !readOnly };
                }
                break;
            case Grid.DateTime:
                _dataAlign = 'left';
                _dataType  = 'date';
                if (editMode) {
                    _cellEditor = { xtype: 'datefield', readOnly: !readOnly , format: self.localeType};
                }
                break;
            case Grid.StringNumber:
                _dataAlign = 'right';
                _dataType = 'int';
                if (editMode) {
                    _cellEditor = { xtype: 'numberfield', readOnly: !readOnly };
                }
                break;
            case Grid.CheckBox:
                _dataAlign = 'center';
                _dataType = 'boolean';
                _columnType = 'checkcolumn';
                break;

            case Grid.tree:
                _dataAlign = 'left';
                _dataType  = 'string';
                _columnType = 'treecolumn';
                if (editMode) {
                    _cellEditor = { xtype: 'textfield', readOnly: !readOnly };
                }
                break;
            default:
                break;
        }

        var column = {
            xtype : _columnType,
            width : params.width,
            text  : params.text,
            height: self.defaultHeaderHeight,
            align: _dataAlign,
            dataIndex: params.dataIndex,
            editor   : _cellEditor
        };
        self._columns.push(column);
        self._fieldList.push(params.dataIndex);
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
                enableTextSelection: true
            },
            store: self.baseStore,
            columns:  self._columns,
            listeners: {
                checkchange: function( node, checked, eOpts) {
                    if (self.useCheckBox === true) {
                        if (node.hasChildNodes()) {
                            node.cascadeBy(function(n) {
                                if(checked === true) {
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
                                    console.debug(n);
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
              nodeObj['expanded'] = true;
              nodeObj['children'] = [];
              nodeObj['id'] = self.treeIndex++;
              if(self.useCheckBox === true){
                  nodeObj['checked'] = true;
              }
          }
          return nodeObj;
    },

    addNode: function(parendtNode, nodeData) {
        var self = this;
        var node = self._getNodeFormat(nodeData);
        if (parendtNode == null || parendtNode == 'undefined') {
            self.baseTree.getRootNode().appendChild(node);
        } else if (parendtNode != null) {
            var parent = self.baseStore.getNodeById(parendtNode.id);
            parent.appendChild(node);
        }
        return node;
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
            if (n.internalId != 'root' && n.data.checked === true) {
                if (n.data.depth == 1) {
                    var data = getObj();
                    data['group'] = n.data['col1'];
                    tempList.push(data);
                    tempData = data;
                }

                if (n.data.depth == 2 && tempData) {
                    tempData['instanceList'].push(n.data['col1']);
                }
            }
        });

        return tempList;
    }


});

