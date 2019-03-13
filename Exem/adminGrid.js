/**
 * Created by JONGHO on 14. 4. 24.
 */
Ext.define("Exem.adminGrid", {
    extend  : 'Ext.container.Container',
    width   : '100%',
    height  : '100%',
    layout  : 'border',

    editMode     : false,               // 일단 cell의 editng기능을 사용하려면  true 그리드에 editor가 추가됨.
    useCheckBox  : true,                // 그리드 가장 좌측에 체크박스가 생길것인지.
    checkMode    : Grid.checkMode.SINGLE,
    showHeaderCheckbox: false,
    rowNumber    : true,                // 그리드 가장 좌측에 Row number를 보일 것인지.
    localeType   : 'Y-m-d H:i:s',       // 그리드 시간값을 표시할 type
    defaultHeaderHeight: null,          // 컬럼의 한칸 기본 높이 설정.
    stripeRows   : true,                // 컬럼 줄무늬 보인지 설정
    itemclick    : null,                // 클릭 이벤트
    cellclick    : null,                //  cell 클릭 이벤트
    celldblclick : null,                // cell 더블 클릭 이벤트
    checkSelect    : null,
    checkDeSelect  : null,
    usePager     : true,                // pager를 사용할 것인지.
    defaultbufferSize: 25,              // 버퍼 defualt size
    defaultPageSize  : 25,              // 한페이지에 보여질 row 수
    autoCommit   : true,                // edit이 되었을때 store에 반영할 것인지

    multiCheckable: false,              // 체크박스 사용안할경우 multiselect가 가능하도록 하기위한 설정.

    adjustGrid     : false,             // 추가 2015-10-05 KJH
    hideGridHeader : false,             // 추가 2015-10-05 KJH

    baseGridCls         : null,


    ignoreRightMouseSelect: false,
    sortableColumns: true,

    constructor: function(config) {
        this.superclass.constructor.call(this, config);
        this._initEnvironment();
    },
    _initEnvironment: function() {
        var self = this;
        self._fieldList = [];
        self._data =  {'rootItems': []};
        self._columns = [];
        self._plugins = [];
        self.sortList = [];
        self.baseGrid = null;
        self.baseStore = null;

        if (self.rowNumber) {
            self._columns.push({
                xtype: 'rownumberer',
                width: 33,
                // 이 렌더러는 row 가 추가 될경우 숫자를 변경시켜준다.
                renderer: function (v, p, record, rowIndex) {
                    return rowIndex + 1;
                }
            });
        }
    },

    beginAddColumns: function() {
        // ...
    },

    endAddColumns: function() {
        var self = this;

        self.selModel =  null;
        self.simpleSelect = false;
        if(self.useCheckBox) {
            self.selModel =  Ext.create('Ext.selection.CheckboxModel',{
                showHeaderCheckbox: self.showHeaderCheckbox,
                mode: self.checkMode
            });
        } else {
            // 체크 박스 없이 multiselect 일 경우
            if (self.multiCheckable) {
                self.simpleSelect = self.multiCheckable;
            }

        }

        var cellEdit;
        if(self.editMode === true) {
            cellEdit = Ext.create('Ext.grid.plugin.CellEditing', {
                clicksToEdit: 1   //1503.16 min
                //clicksToEdit: 2
            });
            self._plugins.push(cellEdit);
        }

        self._plugins.push({
            ptype: 'bufferedrenderer',
            trailingBufferZone: self.defaultbufferSize,    // 현재 렌더링된 스크롤 밑으로 버퍼링할 레코드 갯수
            leadingBufferZone: self.defaultPageSize      // 스크롤 위쪽
        });


        self.baseStore = Ext.create('Ext.data.Store',{
            fields: self._fieldList,
            data: self._data.rootItems,
            pageSize: self.defaultPageSize,
            proxy   : {
                type  : 'memory',
                reader: {
                    type: 'json',
                    rootProperty: 'rootItems'
                },
                // 이거 없으면 paging 기능 동작 안함.
                enablePaging: self.usePager
            }
        });


        self.bbarContainer = null;
        if(self.usePager) {
            self.baseGridPager = Ext.create('Ext.PagingToolbar',{
                store      : self.baseStore,
                width      : '100%',
                border     : false,
                displayInfo: false,
                // displayMsg : 'Displaying Surveys {0} - {1} of {2}',
                // emptyMsg   : 'No Surveys to display',
                listeners: {
                    render: function(){
                        this.down('#refresh').hide();
                    },
                    change: function(){

                    }
                }
            });

            self.bbarContainer = Ext.create('Ext.container.Container',{
                layout: 'vbox',
                width : '100%',
                border: false
            });

            self.bbarContainer.add(self.baseGridPager);
        }

        self.baseGrid = Ext.create('Ext.grid.Panel',{
            width          : '100%',
            height         : '100%',
            region         : 'center',
            flex           : 1,
            cls            : this.baseGridCls,
            selModel       : self.selModel,
            simpleSelect   : self.simpleSelect,
            bbar           : self.bbarContainer,
            plugins        : self._plugins,
            store          : self.baseStore,
            forceFit       : self.adjustGrid,                // 추가 2015-10-05 KJH
            hideHeaders    : self.hideGridHeader,            // 추가 2015-10-05 KJH
            sortableColumns: self.sortableColumns,       // 컬럼 메뉴에서 소트 방지
            viewConfig: {
                markDirty          : true,  // 좌상단 빨간 세모가 없어집니다.
                stripeRows         : self.stripeRows,
                enableTextSelection: true
            },
            columns:  self._columns,
            listeners: {
                render: function() {
//                    if (self.autoCommit) {
//                        this.on('edit', function(editor, e) {
//                            // autoComit이 true면 edit이 발생하면 바로 store에 저장.
//                            e.record.commit();
//                        });
//                    }
                },
                cellclick: function(dv, td, cellIndex, record, tr, rowIndex, e) {
                    if(self.cellclick != null) {
                        self.cellclick(dv, td, cellIndex, record, tr, rowIndex, e);
                    }
                },
                celldblclick: function(dv, td, cellIndex, record, tr, rowIndex, e) {
                    if(self.celldblclick != null) {
                        self.celldblclick(dv, td, cellIndex, record, tr, rowIndex, e);
                    }
                },
                itemclick: function(dv, record, item, index, e) {
                    if (self.itemclick != null) {
                        self.itemclick(dv, record, item, index, e);
                    }
                },
                sortchange: function( ct, column, direction, eOpts ) {
                    if(self.usePager){
                        var index = self.sortList.indexOf(column.dataIndex);

                        if (index < 0) {
                            self.sortList.push(column.dataIndex) ;
                            // column.setSortState('DESC');   ===> 수정
                            column.sortState = 'DESC';
                            column.sort();
                        }
                    } else {
                        self._sortDataSync();
                    }
                },
                select: function(_this, record, index, eOpts) {
                    if (self.useCheckBox === true && self.checkSelect != null) {
                        self.checkSelect(_this, record, index, eOpts);
                    }
                },
                deselect: function(_this, record, index, eOpts) {
                    if (self.useCheckBox === true && self.checkDeSelect != null) {
                        self.checkDeSelect(_this, record, index, eOpts);
                    }
                }
            }
        });

        self.add(self.baseGrid);

    },

    _sortDataSync: function(fieldName, direction) {
        this._data.rootItems.length = 0;
        var datalist = this.baseStore.data.items;
        for(var ix = 0; ix < datalist.length; ix++) {
            var tempObj = {};
            for(var jx = 0; jx < this._fieldList.length; jx++) {
                tempObj[this._fieldList[jx]] = datalist[ix].data[this._fieldList[jx]];
            }
            this._data.rootItems.push(tempObj);
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
        var editOption  = params.editOption || null;
        var hide        = (params.hide)? params.hide : false;
        var hideable    = (params.hideable == null)? true : params.hideable;
        var resizable   = (params.resizable == null)? true : params.resizable;

        switch(params.type) {
            case Grid.Number:
                _dataAlign = 'right';
                _dataType = 'int';
                if (editMode) {
                    _cellEditor = { xtype: 'numberfield', readOnly: !readOnly };
                    _.extend(_cellEditor, editOption);
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
            case Grid.ComboBox:
                _dataAlign = 'center';
                _dataType  = 'boolean';
                if (editMode) {
                    _cellEditor = {
                        xtype   : 'combobox',
                        store   : Ext.create('Ext.data.Store',{
                            fields: ['name', 'value'],
                            data : params.comboData
                        }),
                        displayField: 'name',
                        valueField: 'value',
                        cls : 'config_tab'
                    };
                }
                break;
            default:
                break;
        }
        var column = null;
        if(_columnType !== 'checkcolumn' ){
            column = {
                xtype  : _columnType,
                width  : params.width,
                text   : params.text,
                style  : 'text-align: center',
                height : self.defaultHeaderHeight,
                align  : _dataAlign,
                hidden : hide,
                hideable: hideable,
                resizable: resizable,
                dataIndex: params.dataIndex,
                editor   : _cellEditor,
                renderer:  params.renderer || function (value,meta) {
                    if(value == undefined){
                        return;
                    }
                    var _value = null;
                    switch (_dataType) {
                        case 'int':
                            if (params.type != Grid.StringNumber){
                                _value = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                            } else {
                                _value = value;
                            }
                            meta.tdAttr = 'data-qtip="' + _value + '"';
                            return _value;
                        case 'float':
                            _value = (value.toFixed(Grid.DecimalPrecision)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                            meta.tdAttr = 'data-qtip="' + _value + '"';
                            return _value;
                        case 'date':
                            _value =   this._translateDateTime(value);
                            meta.tdAttr = 'data-qtip="' + _value + '"';
                            return _value;
                        default :
                            if (Ext.isDate(value)) {
                                _value =   self._translateDateTime(value);
                                meta.tdAttr = 'data-qtip="' + _value + '"';
                                return _value;
                            } else {
                                _value = Ext.String.htmlEncode(value);
                                meta.tdAttr = 'data-qtip="' + _value + '"';
                                return value;
                            }
                    }
                }
            };
        } else {
            var disableCls = null;
            if (readOnly === false && editMode === false ) {
                disableCls = 'x-item-enabled';
            }
            column = {
                xtype  : _columnType,
                width  : params.width,
                text   : params.text,
                disabled : !readOnly,
                disabledCls : disableCls,
                style  : 'text-align: center',
                height : self.defaultHeaderHeight,
                align  : _dataAlign,
                hidden : hide,
                dataIndex: params.dataIndex,
                editor   : _cellEditor,
                renderer:  params.renderer || null
            };
        }

        self._columns.push(column);
        self._fieldList.push(params.dataIndex);
    },

    addRenderer: function (dataIndex , func) {
        var column = null;
        var ix     = null;
        var len    = null;

        if(typeof(dataIndex) === 'string'){
            column = this._findColumns(dataIndex);
            column.renderer = func;

        } else if(Array.isArray(dataIndex) === true) {
            for(ix = 0, len = dataIndex.length; ix < len; ix++) {
                column = this._findColumns(dataIndex[ix]);
                column.renderer = func;
            }
        }
        dataIndex = null;
        func      = null;
        column    = null;
        ix        = null;
        len       = null;
    },

    _findColumns: function(dataIndex) {
        var columnsList = this._columns;
        var column      = null;
        var ix          = null;
        var len         = null;
        if (columnsList.length != 0) {
            for(ix = 0, len = columnsList.length; ix < len; ix++ ) {
                if(columnsList[ix].dataIndex == dataIndex) {
                    column = columnsList[ix];
                    break;
                }
            }
        }
        dataIndex   = null;
        ix          = null;
        columnsList = null;
        len         = null;
        return column;
    },

    _translateDateTime: function(dateTime) {
        return Ext.util.Format.date(dateTime, this._displayType);
    },


    _getRowFormat: function (rowData) {
        var self = this;
        var row = {};
        for (var ix = 0; ix < self._fieldList.length; ix++) {
            row[self._fieldList[ix]] = rowData[ix];
        }
        return row;
    },

    drawGrid: function() {
        var self = this;
        self.baseStore.reload();
        //self._sortDataSync();
    },


    addRow: function(rowData) {
        var self = this;
        var row = self._getRowFormat(rowData);
        self._data.rootItems.push(row);
    },

    addRows: function (rowDataList) {
        var self = this;
        for(var ix =0; ix < rowDataList.length; ix++) {
            self.addRow(rowDataList[ix]);
        }
    },

    beginAddRow: function() {
        // ...
    },

    endAddRow: function() {
        var self = this;
        self.drawGrid();
    },


    deleteRow: function(index) {
        var self = this;
        self._data.rootItems.splice(index, 1);
        self.baseStore.reload();
//        self.baseStore.removeAt(index);
    },

    // 2015-10-01 추가.
    deleteRecords: function(records) {
        var indexArray = [];
        if(records.length!=0) {
            var index = null;
            for(var ix = 0; ix < records.length; ix++) {
                index = this.baseStore.indexOf(records[ix]);
                //this.baseStore.removeAt(index);
                if(index != -1) {
                    indexArray.push(index);
                }
            }

            //sort desc <- index 거꾸로 정렬.
            indexArray.sort(function(a, b){return b-a; });

            if(indexArray.length != 0) {
                for(var jx = 0; jx < indexArray.length; jx++) {
                    this.deleteRow(indexArray[jx]);
                }
            }
        }
    },

    //// 스토어에 있는 전체 데이터를 가져옴.
    //getAllRecords: function() {
    //   return this.baseStore.getRange();
    //},

    findRow: function(fieldName , value) {
        var self = this;
        //findRecord( fieldName, value, [startIndex], [anyMatch], [caseSensitive], [exactMatch] )
        // startIndex    : 검색 위치
        // anyMatch      : 부분일치 여부
        // caseSensitive : 대소문자 구분 여부
        // exactMatch    : 정확히 일치 여부      수정 2015-01-21 JH

        var row = self.baseStore.findRecord(fieldName, value, 0, false, false , true);
        return row;
    },

    findRows: function(fieldName , value) {

        var self = this;
        var rows = [];
        self.baseStore.each(function(row) {
            if(row.data[fieldName] == value) {
                rows.push(row);
            }
        });
        return rows;
    },

    insertRow: function(index, record) {
        var self = this;
        var row = self._getRowFormat(record);
        self.baseStore.insert(index, row);
    },

    updateCell: function(field, index, data) {
        var self = this;
        var row =  self.baseStore.getAt(index);
        row.set(field, data);
    },

    clearRows: function() {
        var self = this;
        self._data.rootItems.length = 0;
        self.baseStore.removeAll();
    },

    getRowCount: function() {
        var self = this;
        return self.baseStore.getTotalCount();
    },

    updateRow: function(index, record) {
        var self = this;
        var newRow = self._getRowFormat(record);
        var oldRow = self.baseStore.getAt(index);
        oldRow.set(newRow);
    },

    getSelectedRow: function() {
        var self = this;
        return self.baseGrid.getSelectionModel().getSelection();
    },

    getRow: function(index) {
        var self = this;
        return self.baseStore.getAt(index);
    },

    unCheckAll: function() {
        var self = this;
        self.baseGrid.getSelectionModel().deselectAll();
    },

    checkAll: function() {
        var self = this;
        self.baseGrid.getSelectionModel().selectAll();
    },

    selectByValue: function(field, value, mode) {
        var row = this.findRow(field, value);
        var isKeep = (mode)? mode : false;

        if (row) {
            this.baseGrid.getSelectionModel().select(row, isKeep);
        }
    },

    selectRow: function(index, mode) {
        var self = this;
        // mode 가 true인 경우 select를 유지한다.
        var isKeep = (mode)? mode : false;

        var row =  self.baseStore.getAt(index);
        self.baseGrid.getSelectionModel().select(row, isKeep);
        //self.baseGrid.view.bufferedRenderer.scrollTo(index, true);
        return row;
    },

    // type sencha event명보고 추가
    addEventListener: function(type, fn, scope) {
        var self = this;
        var target = self.baseGrid;
        target.addListener(type, fn, scope);
    },

    setOrderAct: function(fieldName, direction) {
        var self = this;
        self.baseStore.sort({property: fieldName, direction: direction.toUpperCase()});
    },

    commit: function() {
        var self = this;
        self.baseStore.commitChanges();
    },

    getColumnList: function() {
        var self = this;
        return self.baseGrid.headerCt.getGridColumns();
    },

    getVisibleColumnList: function() {
        var self = this;
        return self.baseGrid.headerCt.getVisibleGridColumns();
    },

    getSelectedRowIndex: function() {
        var self = this;
        return self.baseGrid.getSelectionModel().getSelection()[0].index;
    },

    showColumn: function(index) {
        var self = this;
        self.baseGrid.headerCt.getGridColumns()[index].setVisible(true);
    },

    hideColumn: function(index) {
        var self = this;
        self.baseGrid.headerCt.getGridColumns()[index].setVisible(false);
    },

    getModified: function() {
        var self = this;
        return self.baseStore.getModifiedRecords();
    }
});


//----------------------------------------------
// ExtJS 5.1.0.107 Bug Patch Code
//----------------------------------------------
Ext.define('Ext.patch,EXTJS16166', {
    override: 'Ext.view.View',
    compatibility: '5.1.0.107',
    handleEvent: function(e) {
        var me = this,
            isKeyEvent = me.keyEventRe.test(e.type),
            nm = me.getNavigationModel();
            e.view = me;
        if (isKeyEvent) {
            e.item = nm.getItem();
            e.record = nm.getRecord();
        }
        if (!e.item) {
            e.item = e.getTarget(me.itemSelector);
        }
        if (e.item && !e.record) {
            e.record = me.getRecord(e.item);
        }
        if (me.processUIEvent(e) !== false) {
            me.processSpecialEvent(e);
        }
        if (isKeyEvent && !Ext.fly(e.target).isInputField()) {
            if (e.getKey() === e.SPACE || e.isNavKeyPress(true)) {
                e.preventDefault();
            }
        }
    }
});

//161108 수정
//EXTJS-16644관련 버그로 onPartnerScroll가 끝나기 전에 fireScroll이벤트가 동작하고 있어서 발생.
Ext.define('Ext.patch.EXTJS-16644', {
    override : 'Ext.scroll.Scroller',

    fireScroll: function(x, y) {
        var me = this,
            component = me.component;

        if(!me.stopFirePartnerScroll){
            me.invokePartners('onPartnerScroll', x, y);
        }
        me.stopFirePartnerScroll = false;

        if (me.hasListeners.scroll) {
            me.fireEvent('scroll', me, x, y);
        }

        if (component && component.onScrollMove) {
            component.onScrollMove(x, y);
        }
        Ext.GlobalEvents.fireEvent('scroll', me, x, y);
    },

    onPartnerScroll: function(partner, x, y) {
        var axis = partner._partners[this.getId()].axis;

        if (axis) {
            if (axis === 'x') {
                y = null;
            } else if (axis === 'y') {
                x = null;
            }
        }
        this.stopFirePartnerScroll = true;
        this.doScrollTo(x, y, null, true);
    }
});

// 170629 수정
//----------------------------------------------
// ExtJS 5.1.2.748 Bug Patch Code
// EXTJS-22326 - Grid cell editing on sorted column causes store remove event to fire
//----------------------------------------------
Ext.define('Ext.patch.EXTJS-22326', {
    override: 'Ext.Editor',

    startEdit: function(el, value) {
        var me = this,
            field = me.field,
            dom,
            ownerCt = me.ownerCt,
            renderTo = Ext.get(me.renderTo) || (ownerCt && ownerCt.getEl()) || Ext.getBody();

        me.completeEdit();
        me.boundEl = Ext.get(el);
        dom = me.boundEl.dom;

        if (me.useBoundValue && !Ext.isDefined(value)) {
            value = Ext.String.trim(dom.textContent || dom.innerText || dom.innerHTML);
        }

        if (me.fireEvent('beforestartedit', me, me.boundEl, value) !== false) {
            // If NOT configured with a renderTo, render to the ownerCt's element
            // Being floating, we do not need to use the actual layout's target.
            // Indeed, it's better if we do not so that we do not interfere with layout's child management.
            Ext.suspendLayouts();
            renderTo.position();
            if (me.rendered) {
                if (me.el.dom.parentNode !== renderTo.dom) {
                    renderTo.dom.appendChild(me.el.dom);
                    me.container = renderTo;
                }
                // If the editor has been used before, and the grid has been shrink vertically since,
                // The show priot to realign could trigger scrollbars in a non-overflowing grid
                // which would break alignment. Display at top prior to realign call.
                me.el.setY(0);
            } else {
                ownerCt = me.ownerCt;
                me.renderTo = renderTo;
            }

            me.startValue = value;
            me.show();
            me.realign(true);

            // temporarily suspend events on field to prevent the "change" event from firing when resetOriginalValue() and setValue() are called
            field.suspendEvents();
            field.setValue(value);
            field.resetOriginalValue();
            field.resumeEvents();
            field.focus(field.selectOnFocus ? true : [Number.MAX_VALUE]);
            if (field.autoSize) {
                field.autoSize();
            }
            Ext.resumeLayouts(true);
            me.toggleBoundEl(false);
            me.editing = true;
        }
    }
});