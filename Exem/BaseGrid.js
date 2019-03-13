/**
 * Created with IntelliJ IDEA
 * User: JONGHO
 * Date: 13. 11. 20
 * Time: 오전 10:30
 * To change this template use File | Settings | File Templates.
 * modified 2013-12-03
 *  - enablePaging: true (store의  proxy에 해당 옵션이 없으면 paging 기능이 동작하지 않는다.)
 * 2015-11-10  grid filter time format 인경우 sting match 검색으로 수정.
 */

Ext.define('Exem.BaseGrid', {
    extend           : 'Ext.container.Container',
    width            : '100%',
    height           : '100%',
    border           : false,
    layout           : 'border',
    flex             : 1,
    exGrid           : null,
    gridType         : Grid.exGrid,
    adjustGrid       : false,
    itemclick        : null,
    itemdblclick     : null,
    celldblclick     : null,
    cellclick        : null,
    //2015-12-17 JH itemclick과 dblclick 같이 사용할경우 itemclick 대신사용
    itemSelect       : null,
    sortchange       : null,
    onSortChange     : null,
    _fieldInfoList   : [],
    borderVisible    : false,
    _lockAddColumns  : false,
    columnHeaderAlign: Grid.headerAlignCenter,
    stripeRows       : true,
    localeType       : 'Y-m-d H:i:s',
    _displayType     : null,
    // 컬럼 헤더 높이 설정, null 인경우는 알아서 조절
    defaultHeaderHeight : null,
    rowNumber    : false,                // 그리드 가장 좌측에 Row number를 보일 것인지.

    compatibility: '4.2',

    // 0204 수정 JH PagerVisible false 시 문제 떄문에
    defaultPageSize     : 25,
    usePager            : true,
    defaultbufferSize   : 25,

    hideGridHeader      : false,
    gridName            : '',
    useSummary          : false,
    useDrag             : false,

    baseGridCls         : null,
    // tree node state 기본 expand 일지 collapse일지   2015-01-26 JH
    nodeExpend          : true,
    // 우클릭 메뉴를 사용할지 안할지 여부
    useContextMenu      : true,
    // 컬럼 헤더 메뉴 중에 hide를 사용할지 여부 (defalut 사용안함)        2015-02-27 JH
    useColumHideMenu    : false,
    // tree 에서 sort 를 사용할지 여부
    useTreeSortable     : false,
    // 트리에서 노트 접히는게 + - 방식 <->  > 화살표 모양인지 여부.      2015-04-16 JH
    useArrows           : true,
    useFindOn           : true,
    useFilterOn         : true,

    // 그리드 세로 구분선 사용 여부 2015-11-16 JH
    useColumnLines      : false,

    exportFileName      : 'Untitled',

    useCheckbox: {
        use : false,
        mode: Grid.checkMode.SIMPLE,
        headerCheck: false,
        checkOnly: false
    },

    // 트리에서 data가 비어있는 경우 emptytext를 표시 할것인지.      2015-06-17 KJH
    useTreeEmptyText: false,
    // data가 없는 경우 보여질 text                                  2015-06-17 KJH
    treeEmptyText   : '',

    useEmptyText        : false,
    emptyTextMsg        : common.Util.TR('Information does not exist in your current item requests') + '.',

    // 중간에 그리드 locale 값을 변경 해야 하는 경우.
    changeLocale: function(format) {
        this.localeType = format;
        this.setLocale();
    },


    // 시간 설정 관련
    setLocale: function() {
        var self = this;
        self._displayType = self.localeType;
        var dateSplit  =  self._displayType.split(' ');
        var temp = [];
        if( self._displayType.match('Y') ||  self._displayType.match('m-') ||self._displayType.match('y')) {
            switch(nation) {
                case 'ko' :
                    break;
                case 'zh-CN':
                case 'ja' :
                    dateSplit[0] = dateSplit[0].replace(/-/g, '/');
                    break;
                case 'en' :
                    dateSplit[0] = dateSplit[0].replace(/-/g, '/');
                    if (dateSplit[0][0].toUpperCase() == 'Y') {
                        temp.push('/'+dateSplit[0][0]);
                        temp.unshift('/d');
                        temp.unshift('m');
                        dateSplit[0] = temp.join('');
                    }
                    break;
                default:
                    break;
            }
        }
        if(dateSplit[1] != undefined) {
            self._displayType = dateSplit[0] + ' ' + dateSplit[1];

        } else {
            self._displayType = dateSplit[0];
        }

        self      = null;
        dateSplit = null;
        temp      = null;
    },

    constructor: function(config) {

        this.callParent(arguments);

        this.setLocale();
        this._initEnvironment();

        if (this.gridType == Grid.exGrid) {
            this._initGridLayout();
            this._grid = this.pnlExGrid;
        } else {
            this._initTreeLayout();
            this._grid = this.pnlExTree;
        }

        this._createContextMenu();

        this._initGridHeaderDropZone();

        this.loadingMask = Ext.create('Exem.LoadingMask', {
            target: this,
            type: 'small-barloading'
        });


    },

    _initGridHeaderDropZone: function() {
        Ext.define('Override.grid.header.DropZone', {
            override: 'Ext.grid.header.DropZone',

            onNodeOver: function(target, dd, e, data){
                this.callOverridden(arguments);

                var mouseOverHeader = Ext.getCmp(target.id);
                var draggedHeader   = data.header;

                if (mouseOverHeader.groupAttribute == draggedHeader.groupAttribute) {
                    var thisEl        = this.headerCt.ownerCt.getView().getEl();

                    /**
                    var scrollLeftPos = thisEl.getScrollLeft();

                    //if (draggedHeader.getX() > mouseOverHeader.getX()) {
                    //    if (scrollLeftPos > 0 && mouseOverHeader.getX() < 30) {
                    //        thisEl.scrollTo('left', scrollLeftPos - (mouseOverHeader.getWidth()/2));
                    //    }
                    //} else {
                    //    if (draggedHeader.getX() < 30 && mouseOverHeader.getX() < 30 ) {
                    //        thisEl.scrollTo('left', scrollLeftPos - (mouseOverHeader.getWidth()/2));
                    //    } else {
                    //        if (this.headerCt.ownerCt.getWidth()-230 < mouseOverHeader.getX()) {
                    //            thisEl.scrollTo('left', scrollLeftPos + (mouseOverHeader.getWidth()/2));
                    //        }
                    //
                    //    }
                    //}

                    //if (this.headerCt.ownerCt.getWidth()- 200 < mouseOverHeader.getX()- this.headerCt.ownerCt.el.dom.getBoundingClientRect().left) {
                    //    thisEl.scrollBy( (mouseOverHeader.getWidth()/2), 0, false);
                    //} else if ( mouseOverHeader.getX() - this.headerCt.ownerCt.el.dom.getBoundingClientRect().left< 200) {
                    //    thisEl.scrollBy(-(mouseOverHeader.getWidth()/2), 0, false);
                    //}
                    **/
                    if (this.headerCt.ownerCt.getWidth()- 100 < e.browserEvent.x - this.headerCt.ownerCt.el.dom.getBoundingClientRect().left) {
                        thisEl.scrollBy( 5, 0, false);
                    } else if ( mouseOverHeader.getX() - this.headerCt.ownerCt.el.dom.getBoundingClientRect().left< 100) {
                        thisEl.scrollBy(-5, 0, false);
                    }

                    return Ext.dd.DropZone.prototype.dropAllowed;
                } else {
                    return Ext.dd.DropZone.prototype.dropNotAllowed;
                }
            },

            onNodeDrop: function(target, dd, e, data){
                var mouseUpHeader = Ext.getCmp(target.id);
                var draggedHeader = data.header;

                if (mouseUpHeader.groupAttribute == draggedHeader.groupAttribute) {
                    this.callOverridden(arguments);

                    return true;
                } else {
                    return false;
                }

            }
        });
    },

    _initEnvironment: function() {
        var self = this;
        self.border;
        self.headerAlign     = '';
        self.columnWidth     = [];

        self._fieldsList     = [];

        self._columnsList    = [];

        self._localStore     = {'rootItems': []};
        self._treeLocalStore = null;

        // summary 정보 저장하는 array
        self._summaryInfoList = [];
        self._summaryTreeInfoList = [];

        // treegrid 에서 검색어 저장하는 array
        self.findText = [];

        if (self.borderVisible) {
            if (self.hideGridHeader) {
                self.border = {
                    'border' : '1px solid #BBBBBB',
                    'border-top-width' : '0px'
                };
            } else {
                self.border = { 'border' : '1px solid #BBBBBB' };
            }
        } else {
            self.border = { 'border' : 'none' };
        }

        switch (self.columnHeaderAlign) {
            case Grid.headerAlignLeft  :
                self.headerAlign = 'left';
                break;
            case Grid.headerAlignRight :
                self.headerAlign = 'right';
                break;
            case Grid.headerAlignCenter:
                self.headerAlign = 'center';
                break;
            default : break;
        }

        // pager 사용시 filter 후 loadPage(0) 하지 않도록
        this._filterOnOffFlag = false;
/**
//        self.filters = {
//            ftype   : 'filters',
//            encode  : false, // json encode the filter query
//            local   : true,   // defaults to false (remote filtering)
//            filters : []
//        };
 **/

        if (self.rowNumber) {
            self._columnsList.push({
                xtype: 'rownumberer',
                width: 33,
                // 이 렌더러는 row 가 추가 될경우 숫자를 변경시켜준다.
                renderer: function (v, p, record, rowIndex) {
                    return rowIndex + 1;
                }
            });
        }
    },

    _initGridLayout: function() {
        var self = this;
        self.gridStore = Ext.create('Ext.data.Store', {
            fields  : self._fieldsList,
            data    : self._localStore.rootItems,
            pageSize: self.defaultPageSize,
            remoteFilter: true,
            remoteSort: true,
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

        //1412.17 추가 export All
        self.exportStore = Ext.create('Ext.data.Store', {
            fields  : self._fieldsList,
            data    : self._localStore.rootItems,
            proxy   : {
                type  : 'memory',
                reader: {
                    type: 'json',
                    rootProperty: 'rootItems'
                }
            }
        });

        ///// muliti sort 추가부분 --- start
        function getSorters() {
            var sorters = [];
            Ext.each(self.MultipleSortBar.query('button'), function(button) {
                sorters.push(button.sortData);
            }, this);

            return sorters;
        }

        function doSort() {
            self.gridStore.sort(getSorters());
        }

        function changeSortDirection(button, changeDirection) {
            var sortData = button.sortData,
              iconCls  = button.iconCls;
            if (sortData) {
                if (changeDirection !== false) {
                    button.sortData.direction = Ext.String.toggle(button.sortData.direction, "ASC", "DESC");
                    button.setIconCls(Ext.String.toggle(iconCls, "sort-asc", "sort-desc"));
                }
                self.gridStore.clearFilter();
                doSort();
            }
        }

        self._createSorterButtonConfig = function (config) {
            config = config || {};
            Ext.applyIf(config, {
                listeners: {
                    click: function(button) {
                        changeSortDirection(button, true);
                    }
                },
                iconCls    : 'sort-' + config.sortData.direction.toLowerCase(),
                reorderable: true,
                xtype      : 'button'
            });
            return config;
        };

        self.reorderer = Ext.create('Ext.ux.BoxReorderer', {
            listeners: {
                scope: this,
                //update sort direction when button is dropped
                Drop : function(r, c, button) {
                    changeSortDirection(button, false);
                }
            }
        });

        self.droppable = Ext.create('Ext.ux.ToolbarDroppable', {
            /**
             * Creates the new toolbar item from the drop event
             */
            createItem: function(data) {
                var header = data.header,
                  headerCt = header.ownerCt,
                  reorderer = headerCt.reorderer;

                // Hide the drop indicators of the standard HeaderDropZone
                // in case user had a pending valid drop in
                if (reorderer) {
                    reorderer.dropZone.invalidateDrop();
                }

                return self._createSorterButtonConfig({
                    text: header.text,
                    sortData: {
                        property : header.dataIndex,
                        direction: "DESC"
                    }
                });
            },

            /**
             * Custom canDrop implementation which returns true if a column can be added to the toolbar
             * @param {Object} data Arbitrary data from the drag source. For a HeaderContainer, it will
             * contain a header property which is the Header being dragged.
             * @return {Boolean} True if the drop is allowed
             */
            canDrop: function(dragSource, event, data) {
                var sorters   =  getSorters(),
                  header     = data.header,
                  length     = sorters.length,
                  entryIndex = this.calculateEntryIndex(event),
                  targetItem = this.toolbar.getComponent(entryIndex),
                  i;

                // Group columns have no dataIndex and therefore cannot be sorted
                // If target isn't reorderable it could not be replaced
                if (!header.dataIndex || (targetItem && targetItem.reorderable === false)) {
                    return false;
                }

                for (i = 0; i < length; i++) {
                    if (sorters[i].property == header.dataIndex) {
                        return false;
                    }
                }
                return true;
            },

            afterLayout: doSort
        });

        self.MultipleSortBar = Ext.create('Ext.toolbar.Toolbar',{
            hidden: true,
            border: false,
            items : [{
                xtype: 'tbtext',
                text : common.Util.TR('Sorting order') +' : ',
                reorderable: false
            }],
            plugins: [self.reorderer, self.droppable]
        });
        ///// 여기까지 muilt Sort 관련 --------- end

        self.pnlExGridPager = Ext.create('Ext.PagingToolbar',{
            store      : self.gridStore,
            width      : '100%',
            border     : false,
            displayInfo: true,
            displayMsg : '',
            emptyMsg   : '',
            listeners: {
                render: function(){
                    this.down('#refresh').hide();
                    if (!this.displayMsg && self.pagerMsg) {
                        this.displayMsg = self.pagerMsg;
                    }
                },
                change: function(){
                    self._setGridSummary();
                }
            }
        });

        self.summaryArea = Ext.create('Ext.container.Container',{
            width : '100%',
            layout: 'hbox',
            height: 22,
            border: false,
            autoScroll: false,
            style: {
                'background': '#FFFFFF'
            }
        });

        self.bbarContainer = Ext.create('Ext.container.Container',{
            layout: 'hbox',
            width : '100%'
        });

        self.bbarContainer.add(self.summaryArea);
        if (self.usePager) {
            self.bbarContainer.add(self.pnlExGridPager);
        }

        self.selModel = null;
        self.selType = null;
        if(self.useCheckbox.use) {
            self.selModel = Ext.create('Ext.selection.CheckboxModel',{
                showHeaderCheckbox: self.useCheckbox.headerCheck,
                mode: self.useCheckbox.mode,
                checkOnly: self.useCheckbox.checkOnly
            });
        } else {
            self.selType = 'rowmodel';
        }

        if(self.useDrag) {
            self.dragObj = {
                ddGroup: 'GridExample',
                ptype: 'gridviewdragdrop',
                enableDrop: false
            };
        } else {
            self.dragObj = null;
        }

        // summary 영역 처음엔 hide 상태로 , summary label set해줄때 show 상태로 바뀜
        self.summaryArea.setVisible(false);
        self.pnlExGrid = Ext.create('Ext.grid.Panel',{
            width   :'100%',
            border  : false,
            region  : 'center',
            layout  : 'fit',
            title   : self.title,
            style   : self.border,
            forceFit: self.adjustGrid,
            scroll  : 'both',
            columns : [],
            store   : self.gridStore,
            //1412.17 추가 export All
            exportStore: self.exportStore,
            bbar    :  self.bbarContainer,
            tbar    : self.MultipleSortBar,
            hideHeaders    : self.hideGridHeader,
            sortList: [],
            columnsLines: self.useColumnLines,
            cls     :this.baseGridCls,

            // 컬럼 헤더 메뉴중에 hide 부분 사용할지 여부       -- 2015-02-27 JH
            enableColumnHide: this.useColumHideMenu,

            plugins: [
                {   ptype   : 'gridfilters',
                    pluginId: 'gridfilterplugin'
                },
                {
                    // 스크롤 위치에서 보여줄 몇 개의 레코드만 스토어로부터 버퍼링하여 로딩 속도 높임.
                    ptype: 'bufferedrenderer',
                    pluginId: 'bufferedrendererPlugin',
                    // 현재 렌더링된 스크롤 밑으로 버퍼링할 레코드 갯수
                    trailingBufferZone: self.defaultbufferSize,
                    // 스크롤 위쪽
                    leadingBufferZone: self.defaultbufferSize
                }
            ],
            // defalult는 rowmodel,  다른 하나는 cellmodel이 있음.
            selType: 'rowmodel',
            // defalult는 rowmodel,  다른 하나는 cellmodel이 있음.
            selModel: self.selModel,
            viewConfig: {
                stripeRows         : self.stripeRows,
                enableTextSelection: true,
                plugins: self.dragObj ,
                deferEmptyText: false,
                emptyText: ''
//                selectedItemCls    : 'click'        // 클릭 했을때 선택된 row의 색 변경해주는 Class 이름,
            },
            listeners: {
                // 팝업 메뉴 부분.
                cellcontextmenu: function(me, td, cellIndex, record, tr, rowIndex, e ) {
                    if (rowIndex != undefined) {
                        e.stopEvent();
                        // jump 시 접근하는 data <0-- 지우면 jump에 영향있음
                        self.contextMenu.record = record.data;
                        if(self.useContextMenu) {
                            self.contextMenu.showAt(e.getXY());
                        }

                        for(var ix = 0; ix < self.copySubItem.itemList.length; ix++) {
                            self.copySubItem.itemList[ix].eventData = {
                                me  :me,
                                td  :td,
                                tr  :tr,
                                record  : record,
                                rowIndex: rowIndex,
                                cellIndex: cellIndex
                            };
                        }
                    }
                },

                beforeselect: function ( dv, record, index, e ) {
                    if (self.itemSelect != null){
                        self.itemSelect( dv, record, index, e);
                    }
                },

                itemclick: function(dv, record, item, index, e) {
                    if (self.itemclick != null) {
                        self.itemclick(dv, record, item, index, e);
                    }
                },
                itemdblclick: function(dv, record, item, index, e) {
                    if (self.itemdblclick != null) {
                        self.itemdblclick(dv, record, item, index, e);
                    }
                },
                sortchange: function( ct, column, direction, eOpts ) {
                    if(self.onSortChange != null) {
                        self.onSortChange(ct, column, direction, eOpts);
                    }

                    var index = this.sortList.indexOf(column.dataIndex);
                    if (index < 0) {
                        this.sortList.push(column.dataIndex) ;
                        // column.setSortState('DESC');   ===> 수정
                        column.sortState = 'DESC';
                        column.sort();

                    }
                    if(self.usePager && !self._filterOnOffFlag) {
                        self.gridStore.loadPage(1);
                    }

                },
                columnmove: function() {

                    if (self.gridName != '') {
                        self.saveLayout(self.gridName);
                    }
                    if (self.useSummary) {
                        self._reAlignSummaryArea();
                    }

                },
                headerclick: function () {

                },
                itemmouseup: function() {

                },
                celldblclick: function( thisGrid, td, cellIndex, record, tr, rowIndex, e, eOpts ) {
                    if (self.celldblclick != null) {
                        self.celldblclick(thisGrid, td, cellIndex, record, tr, rowIndex, e, eOpts);
                    }
                },
                cellclick: function(thisGrid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                    if (self.cellclick != null) {
                        self.cellclick(thisGrid, td, cellIndex, record, tr, rowIndex, e, eOpts);
                    }
                }
            }
        });

        //  MultipleSortBar 관련 이벤트
        self.pnlExGrid.on('afterlayout',function(grid) {
            var headerCt = grid.child("headercontainer");
            self.droppable.addDDGroup(headerCt.reorderer.dragZone.ddGroup);
        }, self.pnlExGrid, {single:true} );

        // 번역 내용을 추가하기 위해 추가됨.. 2014-07-21
//        self.pnlExGrid.filters.menuFilterText = common.Util.TR('Filter')

        // scroll sync  grid <-> summaryArea
        self.pnlExGrid.getView().on('bodyscroll', function(e, t) {
            clearTimeout(self.pnlExGrid._longClickedTimer);
            self.summaryArea.getEl().setScrollLeft(t.scrollLeft);
        });

        self.add(self.pnlExGrid);
    },

    _reAlignSummaryArea : function() {
        var self = this;
        self.summaryArea.removeAll();
        self._summaryInfoList.length = 0;
        var targetGrid = null;

        if (this.gridType == Grid.exGrid) {
            targetGrid = self.pnlExGrid;
        } else if (self.gridType == Grid.exTree) {
            targetGrid = self.pnlExTree;
        }

        for (var ix = 0; ix < targetGrid.headerCt.getGridColumns().length; ix++) {
            var columnInfo = targetGrid.headerCt.getGridColumns()[ix];
            if(columnInfo.colvisible) {
                var summary = self._addSummaryTextArea(columnInfo.width,  columnInfo.dataIndex, columnInfo.summaryType, columnInfo.align, columnInfo.tdCls);
                columnInfo.info = summary.up();
            }
        }

        if(self._localStore.rootItems.length > 0){
            if (this.gridType == Grid.exGrid) {
                self._setGridSummary();
            } else if (self.gridType == Grid.exTree) {
                self._setTreeSummary();
            }
        }

        self.summaryArea.doLayout();

    },

    _initTreeLayout: function() {
        var self = this;
        self._jsonData = {
            expanded   : true,
            children   : [],
            childNodes : [],
            parentNode : [],
            editing    : false,
            dataindex  : 0
        };


        self.summaryArea = Ext.create('Ext.container.Container',{
            width : '100%',
            layout: 'hbox',
            height: 24,
            border: false,
            autoScroll: false
        });

        self.bbarContainer = Ext.create('Ext.container.Container',{
            layout: 'vbox',
            width : '100%',
            border: false
        });

        self.bbarContainer.add(self.summaryArea);
        // summary 영역 처음엔 hide 상태로 , summary label set해줄때 show 상태로 바뀜
        self.summaryArea.setVisible(false);
        self.pnlExTree = Ext.create('Ext.tree.Panel',{
            width          :'100%',
            border         : false,
            itemId         : 'pnlExTreeItemId',
            region         : 'center',
            style          : self.border,
            columns        : [],
            rootVisible    : false,
            useArrows      : self.useArrows,
            singleExpand   : false,
            forceFit       : self.adjustGrid,
            store          : null,
            isFirst        : false,
            bbar           : self.bbarContainer,
            hideHeaders    : self.hideGridHeader,
            columnsLines   : self.useColumnLines,
            cls            : this.baseGridCls,
            animate        : false,
            // 컬럼 헤더 메뉴중에 hide 부분 사용할지 여부       -- 2015-02-27 JH
            enableColumnHide: this.useColumHideMenu,
            plugins: [
                /**
//                ptype: 'cellediting',
//                clicksToEdit: 2,           // edit하기위한 클릭 횟수,
//                pluginId: 'treeCellEdit',
//                listeners: {
//                    edit: function (editor, e) {
//                        // 이거 해주어야 좌측 상단에 빨간 세모 없어짐.
//                        e.store.sync();
//                    }
//                }
                 **/
                {
                    // 스크롤 위치에서 보여줄 몇 개의 레코드만 스토어로부터 버퍼링하여 로딩 속도 높임.
                    ptype: 'bufferedrenderer',
                    pluginId: 'bufferedrendererPlugin',
                    // 현재 렌더링된 스크롤 밑으로 버퍼링할 레코드 갯수
                    trailingBufferZone: self.defaultbufferSize,
                    // 스크롤 위쪽
                    leadingBufferZone: self.defaultbufferSize
                }
            ],
            // defalult는 rowmodel,  다른 하나는 cellmodel이 있음.
            selType: 'rowmodel',
            viewConfig: {
                deferEmptyText: false,
                stripeRows          : false,
                enableTextSelection : true,
                // 클릭 했을때 선택된 row의 색 변경해주는 Class 이름
                selectedItemCls     : 'click',
                emptyText: ''
            },
            listeners: {
                cellcontextmenu: function(me, td, cellIndex, record, tr, rowIndex, e ) {
                    if (rowIndex != undefined) {
                        e.stopEvent();
                        var itemVisiable = record.childNodes.length != 0;
                        // childnode 가 없는 경우는 menu에서 보여지지 않도록해준다.
                        // menu는 index 또는 itemId로 visible 여부 설정가능.
                        self.contextMenu.setVisibleItem('rowExpandMenuItem', itemVisiable);
                        self.contextMenu.setVisibleItem('rowCollapseMenuItem', itemVisiable);
                        self.contextMenu.record = record.data;
                        if(self.useContextMenu) {
                            self.contextMenu.showAt(e.getXY());
                        }
                        for(var ix = 0; ix < self.copySubItem.itemList.length; ix++) {
                            self.copySubItem.itemList[ix].eventData = {
                                me: me,
                                td:td,
                                cellIndex:cellIndex,
                                record:record,
                                tr:tr,
                                rowIndex:rowIndex
                            };
                        }
                    }
                },
                render: function(me) {
                    var el = me.getEl();
                    if (el) {
                        el.on('contextmenu', function(e) {
                            e.stopEvent();
                        });
                        /**
                        // 롱클릭 시 contextMenu.show
//                        this._longClickedTimer = null;
//                        this.el.dom.addEventListener('mousedown', function(e){
//                            this._longClickedTimer = setTimeout(function(self, e){
//                                if(self.useContextMenu) {
//                                    self.contextMenu.showAt([e.pageX, e.pageY]);
//                                }
//                            }, 1000, this.up(), e); // scope grid의 바같 container.
//                        }.bind(this));
//
//                        this.el.dom.addEventListener('mouseup', function(e){
//                            clearTimeout(this._longClickedTimer);
//                        }.bind(this));
//
//                        this.el.dom.addEventListener('mousemove', function(e){
//                            clearTimeout(this._longClickedTimer);
//                        }.bind(this));
                         **/
                    }
                },
                // item click과 dblclick이 동시에 되지 않아서 추가. click 대신 사용 2015-12-17 JH
                beforeselect: function ( dv, record, index, e ) {
                    if (self.itemSelect != null){
                        self.itemSelect( dv, record, index, e);
                    }
                },
                beforeitemmouseup: function(dv, record, item, index, e, eOpts) {
                    if (self.beforeitemmouseup) {
                        self.beforeitemmouseup(dv, record, item, index, e, eOpts);
                    }
                },
                itemclick: function(dv, record, item, index, e) {
                    if (self.itemclick) {
                        self.itemclick(dv, record, item, index, e);
                    }
                },
                itemdblclick: function(dv, record, item, index, e) {
                    if (self.itemdblclick) {
                        self.itemdblclick(dv, record, item, index, e);
                    }
                },
                columnmove: function() {
                    self.saveLayout(self.gridName);
                    if(self.useSummary) {
                        self._reAlignSummaryArea();
                    }
/**
//                    self._reAlignSummaryArea();

//                    if (fromIdx > toIdx) {
//                        self.summaryArea.items.items.splice(toIdx, 0, self.summaryArea.items.items.splice(fromIdx, 1)[0]);
//                    } else {
//                        self.summaryArea.items.items.splice(toIdx-1, 0, self.summaryArea.items.items.splice(fromIdx, 1)[0]);
//                    }
//                    self.summaryArea.doLayout();
 **/
                },
                celldblclick: function( thisGrid, td, cellIndex, record, tr, rowIndex, e, eOpts ) {
                    if (self.celldblclick != null) {
                        self.celldblclick(thisGrid, td, cellIndex, record, tr, rowIndex, e, eOpts);
                    }
                },
                cellclick: function( thisGrid, td, cellIndex, record, tr, rowIndex, e, eOpts ) {
                    if (self.cellclick != null) {
                        self.cellclick(thisGrid, td, cellIndex, record, tr, rowIndex, e, eOpts);
                    }
                }
            }
        });

        // 검색 조건 나오는 layout
        self.searchArea = Ext.create('Ext.panel.Panel',{
            width : '100%',
            height: 160,
            border: false,
            region: 'south',
            split : true,
            hidden: true,
            layout: 'border'
        });
        self.componentArea = Ext.create('Ext.panel.Panel',{
            width : '100%',
            height: 58,
            border: false,
            itemId: 'retrieveArea',
            layout: 'absolute',
            region: 'north',
            items : [
                self._initTreeRetrieveComponent('searchCombo'),
                self._initTreeRetrieveComponent('field'),
                self._initTreeRetrieveComponent('addButton'),
                self._initTreeRetrieveComponent('findButton'),
                self._initTreeRetrieveComponent('closeButton'),
                self._initTreeRetrieveComponent('conditionLabel')
            ],
            listeners: {
                resize: function() {
                    var label;
                    var delButton;
                    for (var ix = 0; ix < self.findText.length; ix++) {
                        label = self.findText[ix].label;
                        delButton = self.findText[ix].delButton;
                        if (label.orgWidth > self._getSearchAreaWidth()) {
                            label.setWidth(self._getSearchAreaWidth());
                            delButton.setPosition(label.x + label.getWidth(), delButton.y);
                        }
                    }
                    if (self.findText.length > 0) {
                        delButton = self.findText[self.findText.length -1].delButton;
                        self.findButton.setPosition(delButton.x + delButton.getWidth() +3, delButton.y);
                    }
                    // close button
                    self.closeButton.setPosition(this.getWidth() - self.closeButton.getWidth() - 3, self.closeButton.y);
                }
            }
        }) ;

        self.resultArea = Ext.create('Ext.tab.Panel',{
            width : '100%',
            region: 'center',
            border: false,
            activeTab: 0,
            items: [{
                title  : 'Result',
                xtype  : 'grid',
                columns: [],

                store: Ext.create('Ext.data.Store',{
                    fields: [],
                    data  : []
                }),
                viewConfig: {
                    stripeRows         : true,
                    enableTextSelection: true
                },
                listeners: {
                    cellcontextmenu: function(me, td, cellIndex, record, tr, rowIndex, e ) {
                        e.stopEvent();
                    }
                }
            }]
        });

        // scroll sync  tree   grid <-> summaryArea
        self.pnlExTree.getView().on('bodyscroll', function(e, t) {
            clearTimeout(self.pnlExTree._longClickedTimer);
            self.summaryArea.getEl().setScrollLeft(t.scrollLeft);
        });

        self.add(self.pnlExTree);
        self.add(self.searchArea);
        self.searchArea.add( self.componentArea);
        self.searchArea.add(self.resultArea);
        // 그리드 추가해주고 0번 active 시키기.
        //self.resultArea.setActiveTab(0);  -> 위에서 미리 설정해서 주석!~
        // 검색 결과 갯수 보여주는 label
        self.resultArea.tabBar.add({
            xtype : 'label',
            text  : '',
            // 2015-09-17 수정 . UI 가 깨지는 문제.
            margin: '8 0 0 50'
        });


    },

    _getSearchAreaWidth: function() {
        var self = this;
        var result;
        if (self.findText.length > 0) {
            result = self.searchArea.getWidth() - self.searchConditionLabel.getWidth() - self.findText[0].delButton.getWidth() - self.findButton.getWidth() - 29;
        } else {
            result = self.searchArea.getWidth() - self.searchConditionLabel.getWidth();
        }
        return result;
    },

    // tree find data layout 및 기능 부분
    _initTreeRetrieveComponent: function(initType) {
        var self = this,
            selectedComponent;
        // component 사이 여백
        self.splitWidth = 5;
        switch (initType) {
            // findOn 했을때 보여지는 colums combobox
            case 'searchCombo':
                self.searchCombo = Ext.create('Exem.ComboBox',{
                    fieldLabel  : 'Column',
                    valueField  : 'value',
                    multiSelect : false,
                    labelWidth  : 50,
                    width       : 180,
                    x           : 10 ,
                    y           : 5,
                    displayField: 'name',

                    store: Ext.create('Ext.data.Store',{
                        fields:['name', 'value'],
                        data:[]
                    }),
                    listeners: {
                        change: function() {
                            self.JhCombo.setSearchField(this.getValue());
                            self.JhCombo.setValue('');
                        }
                    }
                });
                selectedComponent = self.searchCombo;
                break;

            case 'field':
                // 해당 field의 data가 보여지는 combobox
                self.JhCombo = Ext.create('Exem.AjaxComboBox',{
                    width: 200,
                    data : [],
                    // 2015-09-18 검색시 combo에서 value가 사라지는 부분 때문에 exe.combo option.
                    forceSelection: false,
                    x    : self.searchCombo.x + self.searchCombo.width +  self.splitWidth,
                    y    : self.searchCombo.y,
                    listeners: {
                        beforequery: function() {
                            self.JhCombo.data = self.pnlExTree.getRootNode();
                        }
                    }
                });
                selectedComponent = self.JhCombo;
                break;

            case 'addButton':
                // 검색 조건 추가해주는 addButton
                self.addButton = Ext.create('Ext.button.Button',{
                    text : common.Util.TR('Add'),
                    width: 40,
                    x    : self.JhCombo.x + self.JhCombo.width +  self.splitWidth,
                    y    : self.JhCombo.y,
                    listeners: {
                        'click': function(){
                            // 클릭시 find Button의 x,y positon을 변경 시켜주기.
                            var _setFindButtonPosition = function(){
                                if (self.findText.length == 0) {
                                    self.findButton.setPosition(self.addButton.x + self.addButton.width +  self.splitWidth , self.addButton.y);
                                } else {
                                    var delButton = self.findText[self.findText.length -1].delButton;
                                    self.findButton.setPosition(delButton.x + delButton.getWidth() +3, delButton.y);
                                }
                            };

                            var _addText = function(){
                                // 검색어조건은 4개 까지만
                                if (self.findText.length  == 4) {
                                    Ext.MessageBox.show({
                                        title    : common.Util.TR('Warning'),
                                        msg      : common.Util.TR('You can enter maximum 4 search conditions.'),
                                        icon     : Ext.MessageBox.WARNING,
                                        buttons  : Ext.MessageBox.OK,
                                        multiline: false
                                    });
                                    return;
                                } else if ( self.findText.length  < 4 ) {
                                    var searchStr =  self.JhCombo.getRawValue();
                                    // 검색 text가 없는 경우.
                                    if ( searchStr.length <= 0 || searchStr == null) {
                                        Ext.MessageBox.show({
                                            title    : common.Util.TR('Warning'),
                                            msg      : common.Util.TR('Please enter the search condition.'),
                                            icon     : Ext.MessageBox.WARNING,
                                            buttons  : Ext.MessageBox.OK,
                                            multiline: false
                                        });
                                        self.JhCombo.focus();
                                        return;
                                    }

                                    // 검색한 그리드 결과가 없는 경우 popup
                                    if(!self.JhCombo.getStore().findRecord('name', searchStr)) {
                                        Ext.MessageBox.show({
                                            title    : common.Util.TR('Warning'),
                                            msg      : common.Util.TR('Search condition is not exist column data.'),
                                            icon     : Ext.MessageBox.WARNING,
                                            buttons  : Ext.MessageBox.OK,
                                            multiline: false
                                        });
                                        self.JhCombo.setValue('');
                                        self.JhCombo.focus();
                                        return;
                                    }



                                    // 같은 검색어 입력 체크 하는 부분
                                    var _existSerachCondition = function(strCondition) {
                                        var result = false;
                                        for (var ix = 0; ix < self.findText.length; ix++) {
                                            if (self.findText[ix].label.text == strCondition) {
                                                result = true;
                                                break;
                                            }
                                        }
                                        return result;
                                    };

                                    // 검색할 조건을가지고 label 만들기.
                                    var labelText = '[' + self.searchCombo.getRawValue()+ '] '+ searchStr;

                                    if ( _existSerachCondition(labelText) ){
                                        Ext.MessageBox.show({
                                            title    : common.Util.TR('Warning'),
                                            msg      : common.Util.TR('Search Condition is already exist.'),
                                            icon     : Ext.MessageBox.WARNING,
                                            buttons  : Ext.MessageBox.OK,
                                            multiline: false
                                        });
                                        self.JhCombo.focus();
                                        return;
                                    }

                                    //// 검색할 조건을가지고 label 만들기.
                                    //var labelText = '[' + self.searchCombo.getRawValue()+ '] '+ searchStr
                                    var makeLabel = Ext.create('Ext.form.Label',{
                                        text: labelText,
                                        x   : 113,
                                        y   : self.searchConditionLabel.y + (self.findText.length * 25),

                                        style: {
                                            'text-overflow': 'ellipsis',
                                            'overflow'     : 'hidden',
                                            'white-space'  : 'nowrap',
                                            'display'      : 'inline-block'
                                        },
                                        listeners: {
                                            render : function() {
                                                this.orgWidth = this.getWidth();
                                            }
                                        }
                                    });

                                    self.componentArea.add(makeLabel);
                                    // 검색 조건 label이 추가되면 그 옆으로 delButton 생성
                                    var delButton = Ext.create('Ext.button.Button',{
                                        text: common.Util.TR('Del'),
                                        x   : makeLabel.getWidth() + self.searchConditionLabel.getWidth() + 20,
                                        y   : self.searchConditionLabel.y + (self.findText.length * 25) - 5,

                                        listeners: {
                                            'click': function(){
                                                // del Button 클릭시 검색어 저장 배열에서 지워질 index를 찾는다.
                                                var _findDelIndex = function(){
                                                    var result = -1;
                                                    for (var ix = 0; ix < self.findText.length; ix++) {
                                                        if (self.findText[ix].delButton.id == delButton.id) {
                                                            result = ix;
                                                            break;
                                                        }
                                                    }
                                                    return result;
                                                };
                                                if (self.findText.length > 1) {
                                                    self.componentArea.height = self.componentArea.height - 25;
                                                }
                                                // findText에서 지워질 index
                                                var delIndex =  _findDelIndex();
                                                // 해당 index에 들어있는 검색 label과 button은 파괴 나머지는 위치 재조정.
                                                for (var ix = 0; ix < self.findText.length; ix++) {
                                                    if (delIndex > ix) {
                                                        continue;
                                                    } else if (delIndex == ix) {
                                                        self.findText[ix].delButton.destroy();
                                                        self.findText[ix].label.destroy();
                                                    } else {
                                                        self.findText[ix].delButton.setPosition(self.findText[ix].delButton.x, self.findText[ix].delButton.y - 25);
                                                        self.findText[ix].label.setPosition(110, self.findText[ix].label.y - 25);
                                                    }
                                                }
                                                // 검색어 배열에서 지우기.
                                                self.findText.splice(delIndex, 1);
                                                // 검색 버튼 위치 설정
                                                _setFindButtonPosition();
                                                self.searchArea.doLayout();
                                            }
                                        }
                                    });
                                    // searchString 저장.
                                    self.findText.push({
                                        column      : self.searchCombo.getValue(),
                                        searchString: self.JhCombo.getRawValue(),
                                        label       : makeLabel,
                                        delButton   : delButton
                                    });
                                    self.componentArea.add(delButton);
                                    self.findButton.setPosition(delButton.x+delButton.getWidth()+3, delButton.y);
                                    if (self.findText.length > 1) {
                                        self.componentArea.height = self.componentArea.height + 25;
                                    }
                                }
                                self.JhCombo.setValue('');
                            };
                            _addText();
                            self.searchArea.doLayout();
                        }
                    }
                });
                selectedComponent = self.addButton;
                break;
            case 'findButton':
                // 검색 버튼 추가하기
                self.findButton = Ext.create('Ext.button.Button',{
                    text: common.Util.TR('Find'),
                    y   : self.addButton.y,
                    x   : self.addButton.x + self.addButton.width + self.splitWidth,

                    listeners: {
                        'click': function(){
                            if(self.findText.length ==  0){
                                //find 클릭시 addclick 이벤트 발생시켜주기
                                self.addButton.fireEvent('click');
                            }
                            var resultDataSet = [];
                            // 재귀 여부 설정.
                            for (var ix = 0; ix < self.findText.length; ix++) {
                                //resultDataSet.push(self.findNode(self.findText[ix].column, self.findText[ix].searchString, self._jsonData.data))
                                var searchNode = self.pnlExTree.getRootNode().findChild(self.findText[ix].column, self.findText[ix].searchString, true);
                                if(searchNode){
                                    resultDataSet.push(searchNode);
                                }

                            }
                            var resultGrid = self.resultArea.getActiveTab();
                            resultGrid.store.removeAll();
                            resultGrid.headerCt.removeAll();
                            // tabbar에 검색 결과 갯수 표시해주기.
                            self.resultArea.tabBar.items.items[1].setText(resultDataSet.length+ common.Util.TR(' matche(s) found'));

                            if (resultDataSet.length > 0) {
                                self._loadFindResultData(resultDataSet);
                            }
                        }
                    }
                });
                selectedComponent = self.findButton;
                break;
            case 'closeButton':
                // 검색 layout 부분 닫기 Button
                self.closeButton = Ext.create('Ext.button.Button',{
                    text: 'close',

                    listeners: {
                        'click': function(){
                            self._initializeSearchArea();
                            self.searchArea.hide();
                            self.contextMenu.getComponent('findMenuItem').setText(common.Util.TR('Find On'));
                            self.contextMenu.getComponent('findMenuItem').state = false;
                        }
                    }
                });
                selectedComponent = self.closeButton;
                break;
            case 'conditionLabel':
                // 검색어 조건이 표시되는 label
                self.searchConditionLabel = Ext.create('Ext.form.Label',{
                    text: common.Util.TR('Search Condition')+':',
                    // 2015-09-17 수정 . UI 가 깨지는 문제.
                    width : 100,
                    x   : 10,
                    y   : 35
                });
                selectedComponent = self.searchConditionLabel;
                break;
            default:
                break;
        }

        return selectedComponent;
    },

    _initializeSearchArea: function() {
        var self = this;

        // 버튼& 라벨 제거
        for (var ix = 0; ix < self.findText.length; ix++) {
            self.findText[ix].delButton.destroy();
            self.findText[ix].label.destroy();
        }

        // 검색어 배열 초기화
        self.findText.length = 0;

        //findButton 원위치
        self.findButton.setPosition(self.addButton.x + self.addButton.width +  self.splitWidth , self.addButton.y);

        // 그리드 초기화
        var resultGrid = self.resultArea.getActiveTab();
        resultGrid.store.removeAll();
        resultGrid.headerCt.removeAll();

        // matchs found Text 초기화
        self.resultArea.tabBar.items.items[1].setText('');
    },

    _loadFindResultData: function(resultDataSet) {
        var self = this;
        var tempData = [];
        //결과 보여주는 그리드 field set 해주기.
        var resultGrid    = self.resultArea.getActiveTab();
        var getColumnInfo = self._columnsList;
        var getFieldsinfo = self._fieldsList;
        var dataArray     = [];
        var gridObject    = {};
        var columnType,
            ix, jx;
        for ( ix = 0; ix < getColumnInfo.length; ix++) {
            switch (getFieldsinfo[ix].dataType){
                case 'memo'   :
                case 'string' :
                    columnType = Grid.String;
                    break;
                case 'float'  :
                case 'int'    :
                    columnType = Grid.Number;
                    break;
                default      :
                    break;
            }
            dataArray.push([getColumnInfo[ix].text, getColumnInfo[ix].dataIndex,  getColumnInfo[ix].width, columnType, getColumnInfo[ix].colvisible, getColumnInfo[ix].columnHide, 'gridcolumn', resultGrid ]);
        }
        dataArray.push(['click_info','click_info', 50, Grid.String, false,true,  'gridcolumn', resultGrid]);
        self.addColumns(dataArray);

        for ( ix = 0; ix < resultDataSet.length; ix++) {
            gridObject = {};
            for ( jx = 0; jx < getColumnInfo.length; jx++) {
                gridObject[getColumnInfo[jx].dataIndex] = resultDataSet[ix].data[getColumnInfo[jx].dataIndex];
                //gridObject['idInfo'] = resultDataSet[ix].id
                gridObject['click_info'] = resultDataSet[ix].data.id;
            }
            tempData.push(gridObject);
        }
        //var resultGrid = self.resultArea.getActiveTab()
        resultGrid.store.beginUpdate();
        resultGrid.store.loadData(tempData);
        resultGrid.store.endUpdate();
        // 검색 결과 그리드 dbl 클릭 이벤트
        // dbl 클릭시 해당 data select 효과 주기
        resultGrid.addListener('itemclick',function( _this, record ){
            // 1. 결과 보여주는 그리드에서 컬럼 추가. -> find 한 node 정보 field 또는 id 를 직접 가지고있는다.
            // 2. find 한 노드의 id를 보이지 않는 컬럼에 저장.
            var node = self.pnlExTree.store.getNodeById(record.data.click_info);
            if (node) {
                self.pnlExTree.getView().getSelectionModel().select(node);
            }

        }.bind(this));
    },

    _findData: function(isRecursionCall, dataSet, columnName, findText, resultDataSet ) {
        var self = this;
        for (var ix = 0; ix < dataSet.length; ix++) {
            if (dataSet[ix].data[columnName]  == (findText)) {
                resultDataSet.push(dataSet[ix]);
            }

            if (isRecursionCall && dataSet[ix].childNodes.length > 0) {
                self._findData(isRecursionCall ,dataSet[ix].childNodes , columnName, findText, resultDataSet);
            }
        }
        return resultDataSet;
    },

    // 그리드의 하단 summary가 표시될 label을 create하여 add 시켜주기
    _addSummaryTextArea: function(aWidth, aDataIndex, aSummaryType, align, aColumnBGColor) {
        var self = this;

        var labelStyle = 'font-weight: bold;'+'text-align :'+ align +';'+'text-overflow: ellipsis;  overflow: hidden; display: inline-block; white-space: nowrap; height: 21px  !important; ';
        // 컬럼 bg 색상과 동일하게 summary 부분 색깔도 적용
        var summaryBgColor;
        if (aSummaryType != undefined && aColumnBGColor != undefined){
            // summary가 있을 경우에만.
            summaryBgColor = aColumnBGColor;
        }
        // border 및 margin size를 조절하기위해 추가해준 container
        var bgCon = Ext.create('Ext.container.Container',{
            width : aWidth,
            height: 22,
            layout: 'fit'
        });

        var makeLabel = Ext.create('Ext.form.Label', {
            width    : aWidth - 4,
            flex: 1,
            text     : '',
            margin   : '0 1 0 1',
            style    : labelStyle,
            cls      : summaryBgColor,
            info     : aSummaryType,
            dataIndex: aDataIndex
        });
        bgCon.add(makeLabel);
        self.summaryArea.add(bgCon);
        self._summaryInfoList.push(makeLabel);
        return makeLabel;
    },

    _findIndexByKeyValue: function (obj, key, value) {
        for (var ix = 0; ix < obj.length; ix++) {
            if (obj[ix][key] == value) {
                return ix;
            }
        }
        return null;
    },

    // 트리 symmary set 해주기
    _setTreeSummary: function() {
        var self = this;
        var summaryLabel = '';
        var resultString = '';
        var valueIndex   = null;

        for (var ix = 0; ix < self._summaryInfoList.length; ix++) {
            if (self._summaryInfoList[ix].info != undefined) {
                // summary 영역이 숨김 상태이면 show로 변경
                if(self.summaryArea.isHidden()){
                    self.summaryArea.setVisible(true);
                }
                valueIndex = self._findIndexByKeyValue(self._summaryTreeInfoList, 'dataIndex', self._summaryInfoList[ix].dataIndex );
                if(valueIndex != null){
                    switch (self._summaryInfoList[ix].info){
                        case  'max':
                            summaryLabel = 'MAX : ';
                            resultString = self._summaryTreeInfoList[valueIndex].max;
                            break;
                        case  'sum':
                            summaryLabel = 'TOTAL : ';
                            resultString = self._summaryTreeInfoList[valueIndex].total;
                            break;
                        case  'average':
                            summaryLabel = 'AVG : ';
                            resultString = self._summaryTreeInfoList[valueIndex].total / self._summaryTreeInfoList[valueIndex].count;
                            break;
                        case  'min':
                            summaryLabel = 'MIN : ';
                            resultString = self._summaryTreeInfoList[valueIndex].min;
                            break;
                        case  'count':
                            summaryLabel = 'COUNT : ';
                            resultString = self._summaryTreeInfoList[valueIndex].count;
                            break;
                        default :
                            summaryLabel = '';
                            resultString = '';
                            break;
                    }

                    if (common.Util.isInt(resultString)) {
                        resultString = resultString.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    } else if (common.Util.isFloat(resultString)){
                        resultString = (resultString.toFixed(Grid.DecimalPrecision)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    }
                    resultString = summaryLabel + resultString;

                    self._summaryInfoList[ix].setText(resultString);
                    if (resultString.length != 0) {
                        self._summaryInfoList[ix].getEl().setStyle({
                            'border' : '1px solid #3680A8',
                            'line-height': '22px'
                        });
                    }
                }
            }
        }
    },

    // 그리드 summary set 해주기
    _setGridSummary: function() {
        var self = this;
        var summaryLabel = '';
        var resultString = '';
        var fieldName    = '';

        for (var ix = 0; ix < self._summaryInfoList.length; ix++) {
            if (self._summaryInfoList[ix].info != undefined) {
                // summary 영역이 숨김 상태이면 show로 변경
                if(self.summaryArea.isHidden() && self.useSummary){
                    self.summaryArea.setVisible(true);
                }
                fieldName = self._summaryInfoList[ix].dataIndex;
                switch (self._summaryInfoList[ix].info){
                    case  'max':
                        summaryLabel = 'MAX : ';
                        resultString = self.gridStore.max(fieldName);
                        break;
                    case  'sum':
                        summaryLabel = 'TOTAL : ';
                        resultString = self.gridStore.sum(fieldName);
                        break;
                    case  'average':
                        summaryLabel = 'AVG : ';
                        resultString = self.gridStore.average(fieldName);
                        break;
                    case  'min':
                        summaryLabel = 'MIN : ';
                        resultString = self.gridStore.min(fieldName);
                        break;
                    case  'count':
                        summaryLabel = 'COUNT : ';
                        resultString = self.gridStore.getCount();
                        break;
                    default :
                        summaryLabel = '';
                        resultString = '';
                        break;
                }

                if (common.Util.isInt(resultString)) {
                    resultString = resultString.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                } else if (common.Util.isFloat(resultString)){
                    resultString = (resultString.toFixed(Grid.DecimalPrecision)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                }

                if(resultString == undefined) {
                    resultString = 0;
                }

                resultString = summaryLabel + resultString;

                self._summaryInfoList[ix].setText(resultString);
                if (resultString.length != 0) {
                    self._summaryInfoList[ix].getEl().setStyle({
                        'border' : '1px solid #AAAAAA',
                        'line-height': '22px'
                    });
                }

            }
        }
    },

    // column중에 hidden 인 것들의 list
    _getHiddenColumns: function () {
        var self = this;
        var columns = null;
        var hiddenList = [];
        if(self.gridType == Grid.exGrid) {
            columns = self.pnlExGrid.headerCt.getGridColumns();
        } else if (self.gridType == Grid.exTree){
            columns = self.pnlExTree.headerCt.getGridColumns();
        }

        for (var ix = 0; ix < columns.length; ix++){
            if (columns[ix].columnHide || !columns[ix].colvisible) {
                hiddenList.push(columns[ix].dataIndex);
            }
        }
        return hiddenList;
    },


    // 우클릭 메뉴 생성
    _createContextMenu: function(){
        var self = this;
        self.contextMenu = Ext.create('Exem.ContextMenu');
        self.copySubItem = Ext.create('Exem.ContextMenu');
        self.copySubItem.addItem({
            title : common.Util.TR('Cell'),
            itemId: 'cellcopy',
            icon  : '',
            target: self,
            // 한칸
            fn: function() {

                var columnIndex = this.eventData.cellIndex;
                var columnName = null;
                var retText = '', textData = '';

                if (self.gridType == Grid.exGrid) {
                    columnName = self.pnlExGrid.headerCt.getHeaderAtIndex(columnIndex).dataIndex;
                    if(self.pnlExGrid.getSelectionModel().hasSelection()) {
                        textData = self.pnlExGrid.getSelectionModel().getSelection()[0].data;
                        retText = textData[columnName] + '';
                    }

                } else if (self.gridType == Grid.exTree) {
                    columnName = self.pnlExTree.headerCt.getHeaderAtIndex(columnIndex).dataIndex;

                    self.pnlExTree.getRootNode().cascadeBy(function(node) {
                        if(node.internalId == this.eventData.record.internalId) {
                            retText = node.data[columnName] + '';
                        }
                    }.bind(this));
                }

                if (columnName && !retText) {
                    try {
                        retText = this.eventData.record.data[columnName];
                    } catch(e) {
                        retText = '';
                    }
                }

                if (retText == null) {
                    retText = '';
                }

                //grid, tree 둘다 사용 가능.
                // this.eventData는 cellContaext Listeners에서 들어온 data를 달아놓은 것임.
                if (window.clipboardData) {
                    window.clipboardData.setData( 'Selected Cell (Ctrl + C)', retText);
                } else {
                    window.prompt('Selected Cell (Ctrl + C)', retText);
                }
            }
        });

        self.copySubItem.addItem({
            title : common.Util.TR('Row'),
            itemId: 'recordcopy',
            icon  : '',
            target: self,
            // record 한줄
            fn: function() {
                var dataArray = [];
                var hiddenColumns = self._getHiddenColumns();
                var targetGrid = null;
                if (self.gridType == Grid.exGrid) {
                    targetGrid = self.pnlExGrid;
                } else if (self.gridType == Grid.exTree) {
                    targetGrid = self.pnlExTree;
                }

                var textData, recordData;
                var checkHidden;
                if (targetGrid.getSelectionModel().hasSelection()) {
                    textData = targetGrid.getSelectionModel().getSelection()[0].data;
                } else {
                    recordData = Ext.clone(this.eventData.record);
                    textData   = recordData.data;
                }

                for (var ix =0; ix < self._fieldInfoList.length; ix++) {
                    checkHidden = hiddenColumns.indexOf(self._fieldInfoList[ix].name);
                    if(checkHidden == -1) {
                        if (typeof textData[textData[self._fieldsList[ix].name]] == 'object'){
                            textData[textData[self._fieldsList[ix].name]] = Ext.util.Format.date(textData[prop], self._displayType);
                        }
                        dataArray.push(textData[self._fieldInfoList[ix].name]);
                    }
                }

                // IE인경우 아닌 경우는 window.prompt로 data를 보여줌.
                if (window.clipboardData) {
                    window.clipboardData.setData('Selected Row (Ctrl + C)', dataArray);
                } else {
                    window.prompt('Selected Row (Ctrl + C)', dataArray);
                }
            }
        });

        self.copySubItem.addItem({
            title : common.Util.TR('Header + Row'),
            itemId: 'rowscopy',
            icon  : '',
            target: self,
            // 컬럼 헤더랑, record 한줄
            fn: function() {
                var columNamns = [], dataArray = [],
                    columnList = null, grid = null,
                    checkHidden, ix,
                    hiddenColumns = self._getHiddenColumns();
                if (self.gridType == Grid.exGrid) {
                    columnList =  self.pnlExGrid.headerCt.getVisibleGridColumns();
                    grid = self.pnlExGrid;
                } else if (self.gridType == Grid.exTree) {
                    columnList =  self.pnlExTree.headerCt.getVisibleGridColumns();
                    grid = self.pnlExTree;
                }
                // 헤더 name List
                for (ix = 0; ix < columnList.length; ix ++ ) {
                    checkHidden = hiddenColumns.indexOf(columnList[ix].text);
                    if(checkHidden === -1) {
                        columNamns.push(columnList[ix].text);
                    }
                }

                var textData, recordData;
                if (grid.getSelectionModel().hasSelection()) {
                    textData = grid.getSelectionModel().getSelection()[0].data;
                } else {
                    recordData = Ext.clone(this.eventData.record);
                    textData   = recordData.data;
                }

                for (ix =0; ix < self._fieldInfoList.length; ix++) {
                    checkHidden = hiddenColumns.indexOf(self._fieldInfoList[ix].name);
                    if (checkHidden === -1) {
                        if (typeof textData[textData[self._fieldsList[ix].name]] === 'object'){
                            textData[textData[self._fieldsList[ix].name]] = Ext.util.Format.date(textData[prop], self._displayType);
                        }
                        dataArray.push(textData[self._fieldInfoList[ix].name]);
                    }
                }

                // IE인경우 아닌 경우는 window.prompt로 data를 보여줌.
                if (window.clipboardData) {
                    window.clipboardData.setData('Header + Row (Ctrl + C)', dataArray);
                } else {
                    window.prompt('Header + Row (Ctrl + C)', columNamns +'\r\n\r\n'+ dataArray);
                }


            }
        });

        self.copySubItem.addItem({
            title : common.Util.TR('Fields'),
            itemId: 'fieldscopy',
            icon  : '',
            target: self,
            // 세로 한줄
            fn: function() {
                var dataArray = [];
                var columnIndex = this.eventData.cellIndex;
                var columnName = null;
                if(self.gridType == Grid.exGrid){
                    columnName = self.pnlExGrid.headerCt.getHeaderAtIndex(columnIndex).dataIndex;
                    for (var ix = 0; ix < self._localStore.rootItems.length; ix++ ) {
                        dataArray.push(self._localStore.rootItems[ix][columnName]);
                    }
                } else if (self.gridType == Grid.exTree) {
                    columnName = self.pnlExTree.headerCt.getHeaderAtIndex(columnIndex).dataIndex;
                    self.pnlExTree.getRootNode().cascadeBy(function(node){
                        if(node.internalId == 'root'){
                            return;
                        }
                        dataArray.push(node.data[columnName]);
                    });
                }
                // IE인경우 아닌 경우는 window.prompt로 data를 보여줌.
                if (window.clipboardData) {
                    window.clipboardData.setData('Selected fields (Ctrl + C)', dataArray);
                } else {

                    window.prompt('Selected fields (Ctrl + C)', dataArray.join('\r\n'));
                }
            }
        });

        //index0
        self.contextMenu.addItem({
            title : common.Util.TR('Export Excel'),
            itemId: 'exportMenuItem',
            icon  : '',
            target: self,

            fn: function() {
                self.loadingMask.show();

                setTimeout(function() {
                    var targetGrid ;

                    if (self.gridType == Grid.exGrid) {
                        targetGrid = self.pnlExGrid;
                        self.exportStore.loadData(self._localStore, false);
                        self.exportStore.load();
                        // 화면에 보이는 data와 같이 export 해주기위함. 2015-11-13 JH
                        if (self.pnlExGrid.sortList.length != 0) {
                            var dataindex = self.gridStore.sorters.items[0]._property;
                            var direction  = self.gridStore.sorters.items[0]._direction;
                            self.exportStore.sort( dataindex,  direction.toUpperCase());
                        }
                    }
                    else if (self.gridType == Grid.exTree) {
                        targetGrid = self.pnlExTree;
                    }

                    targetGrid.columns = targetGrid.headerCt.getGridColumns();
                    targetGrid.title   = self.exportFileName;
                    targetGrid.exportCallback = function() {
                        self.loadingMask.hide();
                    }.bind(self);

                    targetGrid.downloadExcel();
                }, 10);

            }
        });
        //index1
        self.contextMenu.addItem({
            title : common.Util.TR('Copy(To Clipboard)'),
            itemId: 'copyMenuItem',
            icon  : '',
            target: self,
            items: self.copySubItem,
            fn: function() {

            }
        });

        self.contextMenu.addItem({
            title :  common.Util.TR('Show/Hide Columns'),
            itemId: 'showHideMenuItem',
            icon  : '',
            target: self,

            fn: function() {
                var selectWindow = Ext.create('Exem.selectItemWindow',{
                    target: self
                });
                selectWindow.setWindowTitle( common.Util.TR('Select Columns'));
                if (self.contextBaseCls) {
                    selectWindow.addCls(self.contextBaseCls);
                }
                if (self.gridType == Grid.exGrid) {
                    selectWindow.showColumns(self.pnlExGrid);
                } else if (self.gridType == Grid.exTree) {
                    selectWindow.showColumns(self.pnlExTree);
                }
            }
        });

        if (self.gridType == Grid.exGrid && self.useFilterOn) {
            self.contextMenu.addItem({
                title :  common.Util.TR('Filter On'),
                itemId: 'filterMenuItem',
                icon  : '',
                target: self,

                fn: function() {
                    var GridColumns,
                        ix;

                    if (this.text == common.Util.TR('Filter On')) {
                        var filterList  = [];
                        var dataIndex   = null;
                        var colType     = null;

                        self._filterOnOffFlag = true;
                        this.setText( common.Util.TR('Filter Off'));
                        GridColumns = self.pnlExGrid.headerCt.getGridColumns();

                        for (ix = 0; ix < GridColumns.length; ix++) {
                            dataIndex = GridColumns[ix].dataIndex;
                            colType   = GridColumns[ix].colType;
                            switch (colType) {
                                case  Grid.Number:
                                case  Grid.StringNumber:
                                case  Grid.Float:
                                    filterList.push({
                                        type     : 'numeric',
                                        dataIndex: dataIndex ,
                                        fields   : { gt: { decimalPrecision: 3 }, lt: { decimalPrecision: 3 }, eq: { decimalPrecision: 3 }}
                                    });
                                    break;
                                case Grid.String:
                                case Grid.DateTime:
                                    filterList.push({
                                        type     : 'string',
                                        dataIndex: dataIndex
                                    });
                                    break;
                                default:
                                    break;
                            }


                        }
                        if (filterList.length > 0){
                            self.pnlExGrid.filters.addFilters(filterList);
                        }
                    } else {
                        this.setText(common.Util.TR('Filter On'));
                        self.pnlExGrid.filters.clearFilters();

                        GridColumns = self.pnlExGrid.headerCt.getGridColumns();

                        for (ix = 0; ix < GridColumns.length; ix++) {
                            GridColumns[ix].filter = null;
                        }

                        //필터 제거 하고 load 한번 해주어야 원래 상태로 바뀜.
                        self.pnlExGrid.store.load();
                        self._filterOnOffFlag = false;
                    }
                }
            });

/**
            // 150424 LSM
//            self.contextMenu.addItem({
//                title : common.Util.TR('Multiple Sort On'),
//                itemId: 'multipleSortItme',
//                icon  : '',
//                target: self,
//
//                fn: function() {
////                    if (self.MultipleSortBar.hidden) {
//                    if (this.text == 'Multiple Sort On') {
//                        this.setText(common.Util.TR('Multiple Sort Off'));
//                        self.MultipleSortBar.setVisible(true);
//                        var sortedColumns = null;
//                        var getColumns = self.pnlExGrid.headerCt.getGridColumns();
//                        for (var ix = 0; ix < getColumns.length; ix++) {
//                            getColumns[ix].sortable = false;
//                            if(getColumns[ix].sortState != null || getColumns[ix].sortState != undefined){
//                                sortedColumns = getColumns[ix];
//                            }
//                        }
//                        // sort 상태인 컬럼은 Multiple Sort On시 바로 추가해주기
//                        if (sortedColumns != null) {
//                            self.MultipleSortBar.add(self._createSorterButtonConfig({
//                                text: sortedColumns.text,
//                                sortData: {
//                                    property: sortedColumns.dataIndex,
//                                    direction: sortedColumns.sortState
//                                }
//                            }));
//                        }
//
//                    } else {
//                        this.setText(common.Util.TR('Multiple Sort On'));
//
//                        self.MultipleSortBar.setVisible(false);
//
//                        var getColumns = self.pnlExGrid.headerCt.getGridColumns();
//                        for (var ix = 0; ix < getColumns.length; ix++) {
//                            getColumns[ix].sortable = true;
//                        }
//
//
//                        for (var ix = self.MultipleSortBar.items.items.length-1; ix >= 1 ; ix--) {
//                            self.MultipleSortBar.items.items[ix].destroy();
//                        }
//
//
//                    }
//                }
//            });
**/
        }


        if(self.gridType == Grid.exTree) {
            if (self.useFindOn) {
                // 트리일 경우만 생기는 메뉴 item
                // 찾기 기능 비활성화 처리 Redmine #3413
                //self.contextMenu.addItem({
                //    title : common.Util.TR('Find On'),
                //    itemId: 'findMenuItem',
                //    icon  : '',
                //    target: self,
                //    state : false,
                //
                //    fn: function() {
                //        if (self.searchArea.hidden) {
                //            self.searchArea.show();
                //            var columnList = self.pnlExTree.headerCt.getGridColumns();
                //            var tempData   = [];
                //            for (var i = 0; i < columnList.length; i++) {
                //                if(!columnList[i].columnHide && columnList[i].colvisible) {
                //                    tempData.push({ 'name': columnList[i]['text'], 'value': columnList[i]['dataIndex'] });
                //                }
                //            }
                //            self.searchCombo.store.loadData(tempData);
                //            self.searchCombo.setValue(self.searchCombo.store.getAt(0));
                //            self.JhCombo.data = self.pnlExTree.getRootNode();
                //            this.setText(common.Util.TR('Find Off'));
                //            this.state = true;
                //        } else {
                //            self._initializeSearchArea();
                //            self.searchArea.hide();
                //            this.setText(common.Util.TR('Find On'));
                //            this.state = false;
                //        }
                //    }
                //});
            }

            self.contextMenu.addItem({
                title : common.Util.TR('Expand All'),
                itemId: 'expandAllMenuItem',
                icon  : '',
                target: self,

                fn: function() {
                    self.pnlExTree.expandAll();
                }
            });

            self.contextMenu.addItem({
                title : common.Util.TR('Collapse All'),
                itemId: 'collapseAllMenuItem',
                icon  : '',
                target: self,

                fn: function() {
                    self.pnlExTree.collapseAll();
                }
            });

            // 아래 두개는 child 가 없으면 보이지 않음.
            self.contextMenu.addItem({
                title : common.Util.TR('Row Expand'),
                itemId: 'rowExpandMenuItem',
                icon  : '',
                target: self,

                fn: function() {
                    var targetRow = self.pnlExTree.getSelectionModel().getSelection();
                    targetRow[0].expand();
                }
            });

            self.contextMenu.addItem({
                title : common.Util.TR('Row Collapse'),
                itemId: 'rowCollapseMenuItem',
                icon  : '',
                target: self,

                fn: function() {
                    var targetRow = self.pnlExTree.getSelectionModel().getSelection();
                    targetRow[0].collapse();
                }
            });
        }

        // 이미지 캡쳐
        self.contextMenu.addItem({
            title    : common.Util.TR('Save Image'),
            itemId: 'saveImageMenuItem',
            target   : self,
            fn       : function(){
                html2canvas( this.el.dom ,
                  {
                      // Canvas 로 복사 완료 이벤트
                      onrendered: function(canvas)
                      {
                          procDownloadImg( canvas.toDataURL()  );
                      }

                  });
            }.bind(this)
        });
/**
        // 전체 이미지 캡쳐
//        self.contextMenu.addItem({
//            title    : common.Util.TR('Image Capture'),
//            target   : self,
//            itemId: 'cropesaveMenuItem',
//            fn       : function(){
//                html2canvas(document.body, {
//                    onrendered: function(canvas){
//                        // Crop Window 를 팝업 시킨다.
//
//                        var cropWindow = Ext.getCmp('cropimage_window');
//                        if( !cropWindow )
//                            cropWindow = new Ext.create('pa.layout.cropimage.window');
//
//                        //  console.log( canvas.toDataURL() );
//
//                        // 캡춰한 이미지 던짐
//                        cropWindow.setImage( canvas.toDataURL() );
//                        // 팝업 띄움.
//                        cropWindow.show();
//                    }
//                });
//            }.bind(this)
//        });
 **/
    },

    // type sencha event명보고 추가해주면됨
    addEventListener: function(type, fn, scope) {
        var self = this;
        var target ;
        if (self.gridType == Grid.exGrid) {
            target = self.pnlExGrid;
        } else if (self.gridType == Grid.exTree) {
            target = self.pnlExTree;
        }
        target.addListener(type, fn, scope);
    },

    // 그리드 pager 보일지 여부. drawGrid 이후에 설정해주어야 정상 작동
    PagerVisible: function(status) {
        var self = this;
        if (status === true) {
            self.setGridPageSize(self.defaultPageSize);
            self.pnlExGridPager.show();
        } else {
            self.setGridPageSize(self.gridStore.totalCount);
            self.pnlExGridPager.hide();
        }
    },

    // 한페이지에 표시될 그리드 data 수 설정.
    setGridPageSize: function(pageSize) {
        var self = this;

        self.pnlExGrid.plugins.trailingBufferZone = parseInt(pageSize);
        self.pnlExGrid.plugins.leadingBufferZone  = parseInt(pageSize);

        self.gridStore.pageSize = parseInt(pageSize);
    },

    setOrderAct: function(fieldName, direction) {
        var self = this;
        if (self.gridType == Grid.exGrid) {
            self.pnlExGrid.sortList.length = 0;
            self.pnlExGrid.sortList.push(fieldName);
            self.gridStore.sort({property: fieldName, direction: direction.toUpperCase()});
        }
    },

    beginAddColumns: function() {
        var self = this;
        self._lockAddColumns = true;
    },

    endAddColumns: function() {
        var self = this;

        self._lockAddColumns = false;

        if (self.gridType == Grid.exGrid) {
            self.pnlExGrid.headerCt.add(self._columnsList);
        } else {
            self.pnlExTree.headerCt.add(self._columnsList);
        }
    },

    _translateDateTime: function(dateTime) {
        var self = this;
        return Ext.util.Format.date(dateTime, self._displayType);

    },

    beginGroupColumns: function(groupText){
        var self = this;
        self.groupColumn = {
            text : groupText,
            columns : []
        };

        self.isBeginGroup = true;
    },

    endGroupColumns: function(){
        var self = this;
        self._columnsList.push(self.groupColumn);
        self.groupColumn = null;
        self.isBeginGroup = false;
    },

    addColumn: function() {
        var self = this;
        var addGridColumn = function() {
            var aText          = arguments[0][0];
            var aDataIndex     = arguments[0][1];
            var aWidth         = arguments[0][2];
            var aDataType      = arguments[0][3];
            var aColVisible    = arguments[0][4];
            var aColumnHide    = arguments[0][5];
            var aSummaryType   = arguments[0][6];
            var aColumnBGColor = arguments[0][7];


            var dataAlign = 'center';
            var dataType  = 'auto';
            var bgColumnColor = '';
            // 그리드 셀 클릭시 사용되는 editor
            var aCellEditor = null;
            var colType     = null;
            var sortType    = null;

            if (aColVisible == undefined) {
                aColVisible = true;
            }

            if (aColumnHide == undefined) {
                aColumnHide = false;
            }

            if (aColumnHide) {
                aColVisible = false;
            }

            switch (aDataType) {
                case Grid.Number:
                    dataAlign = 'right';
                    dataType = 'int';
                    sortType = 'asInt';
                    colType = Grid.Number;
                    aCellEditor = { xtype: 'numberfield', readOnly: true };
                    break;
                case Grid.Float:
                    dataAlign = 'right';
                    dataType = 'float';
                    sortType = 'asFloat';
                    colType = Grid.Float;
                    aCellEditor = { xtype: 'numberfield', readOnly: true };
                    break;
                case Grid.String:
                    dataAlign = 'left';
                    dataType = 'string';
                    //sortType = 'asText'
                    // 대소문자 상관없이 sort
                    sortType = 'asUCString';
                    colType = Grid.String;
                    aCellEditor = { xtype: 'textfield', readOnly: true };
                    break;
                case Grid.DateTime:
                    dataAlign = 'left';
                    dataType = 'date';
                    sortType = 'asDate';
                    colType = Grid.DateTime;
                    aCellEditor = { xtype: 'datefield', readOnly: true , format: self.localeType};
                    break;
                case Grid.StringNumber:
                    dataAlign = 'right';
                    dataType  = 'auto';
                    sortType = 'asFloat';
                    colType = Grid.StringNumber;
                    aCellEditor = { xtype: 'numberfield', readOnly: true };
                    break;
                default:
                    break;
            }

            self._fieldsList[self._fieldsList.length] = { name : aDataIndex, type: dataType, useNull: true, sortType: sortType };
            self.gridStore.setFields (self._fieldsList);
            //1412.17 추가 export All
            self.exportStore.setFields (self._fieldsList);


            if(aColumnBGColor != undefined){
                bgColumnColor = aColumnBGColor;
            }

            var column = Ext.create('Ext.grid.column.Column', {
                'text'       : aText,
                'dataIndex'  : aDataIndex,
                'width'      : aWidth,
                'height'     : self.defaultHeaderHeight,
                'align'      : dataAlign,
                'dataType'   : dataType,
                'style'      : 'text-align:' + self.headerAlign,
                'colvisible' : aColVisible,
                'columnHide' : aColumnHide,
                'hidden'     : !aColVisible,
                'hideable'   : !aColumnHide,
                'summaryType': aSummaryType,
                'tdCls'      : bgColumnColor,
                'info'       : null,
                'editor'     : aCellEditor,
                'colType'    : colType,
                listeners: {
                    resize: function(){
                        // 컬럼 resize 이벤트 발생시, 해당 summary Label도 resize 해주기
                        if (this.info != null) {
                            this.info.setSize(arguments[1],arguments[2]);
                        }
                    },
                    added: function(){
                        if(aColVisible){
                            var summaryLabel = self._addSummaryTextArea(aWidth, aDataIndex, aSummaryType, dataAlign, aColumnBGColor);
                            // label border를 위해 bgCon을 추가해서 resize시에는 bgCon를 resize해주어야함.
                            this.info = summaryLabel.up();
                            summaryLabel = null;
                        }
                    }
                },

                renderer: function (value, meta) {
                    if(value == undefined){
                        return;
                    }

                    var _value = null,
                        _qtipValue = null;
                    switch (meta.column.dataType) {
                        case 'int':
                            if (meta.column.colType != Grid.StringNumber) {
                                if (value % 1 != 0) {
                                    _value = value;
                                } else {
                                    _value = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                                }
                            } else {
                                _value = value;
                            }
                            meta.tdAttr = 'data-qtip="' + _value + '"';
                            return _value;
                        case 'float':
                            _value = common.Util.toFixed(value,Grid.DecimalPrecision);
                            meta.tdAttr = 'data-qtip="' + _value + '"';
                            return _value;
                        case 'date':
                            _value =   self._translateDateTime(value);
                            meta.tdAttr = 'data-qtip="' + _value + '"';
                            return _value;

                        default :
                            _value = Ext.String.htmlEncode(value);
                            _qtipValue = Ext.String.htmlEncode(_value);
                            meta.tdAttr = 'data-qtip="' + _qtipValue + '"';
                            return _value;
                    }
                }

            });

            if(self.isBeginGroup){
                self.groupColumn.columns.push(column);
            } else{
                if (!self._lockAddColumns) {
                    self.pnlExGrid.headerCt.add(column);
                } else {
                    self._columnsList.push(column);
                }
            }

            aText          = null;
            aDataIndex     = null;
            aWidth         = null;
            aDataType      = null;
            aColVisible    = null;
            aColumnHide    = null;
            aSummaryType   = null;
            aColumnBGColor = null;
            dataAlign      = null;
            dataType       = null;
            bgColumnColor  = null;
            aCellEditor    = null;
            colType        = null;
            column         = null;
            sortType       = null;
        };


        var addTreeColumn = function() {
            var aText          = arguments[0][0];
            var aDataIndex     = arguments[0][1];
            var aWidth         = arguments[0][2];
            var aDataType      = arguments[0][3];
            var aColVisible    = arguments[0][4];
            var aColumnHide    = arguments[0][5];
            var aColumnType    = arguments[0][6];
            var aResultGrid    = arguments[0][7];
            var aSummaryType   = arguments[0][8];
            var aColumnBGColor = arguments[0][9];

            var dataAlign = 'center';
            var dataType  = 'auto';
            var bgColumnColor = '';
            // 그리드 셀 클릭시 사용되는 editor
            var aCellEditor = null;

            if (aColVisible == undefined) {
                aColVisible = true;
            }

            if (aColumnHide == undefined) {
                aColumnHide = false;
            }

            if (aColumnHide) {
                aColVisible = false;
            }

            switch (aDataType) {
                case Grid.Number:
                case Grid.StringNumber:
                    dataAlign = 'right';
                    dataType = 'int';
                    aCellEditor = { xtype: 'numberfield', readOnly: true };
                    break;
                case Grid.Float:
                    dataAlign = 'right';
                    dataType = 'float';
                    aCellEditor = { xtype: 'numberfield', readOnly: true };
                    break;
                case Grid.String:
                    dataAlign = 'left';
                    dataType = 'string';
                    aCellEditor = { xtype: 'textfield', readOnly: true };
                    break;
                case Grid.DateTime:
                    dataAlign = 'left';
                    dataType = 'date';
                    aCellEditor = { xtype: 'datefield', readOnly: true , format: self.localeType};
                    break;
                default :
                    break;
            }

            if (aColumnType == 'treecolumn') {
                dataAlign = 'left';
            }

            if (aResultGrid != undefined) {
//                aResultGrid.store.model.setFields(self._fieldsList)
                aResultGrid.store.setFields(self._fieldsList);
            } else {
                self._fieldsList.push({ name: aDataIndex, type: dataType, useNull: true });
            }


            if(aColumnBGColor != undefined){
                bgColumnColor = aColumnBGColor;
            }

            var column = {
                'text'       : aText,
                'dataIndex'  : aDataIndex,
                'width'      : aWidth,
                'height'     : self.defaultHeaderHeight,
                'align'      : dataAlign,
                'dataType'   : dataType,
                'sortable'   : self.useTreeSortable,
                'style'      : 'text-align:' + self.headerAlign,
                'colvisible' : aColVisible,
                'columnHide' : aColumnHide,
                'hidden'     : !aColVisible,
                'hideable'   : !aColumnHide,
                'summaryType': aSummaryType,
                'tdCls'      : bgColumnColor,
                'info'       : null,
                'editor'     : aCellEditor,
                'colType'    : aDataType,
                listeners: {
                    resize: function(){
                        // 컬럼 resize 이벤트 발생시, 해당 summary Label도 resize 해주기
                        if (this.info != null) {
                            this.info.setSize(arguments[1],arguments[2]);
                        }
                    },
                    added: function(){
                        if(aColVisible){
                            var summaryLabel = self._addSummaryTextArea(aWidth, aDataIndex, aSummaryType, dataAlign, aColumnBGColor);
                            this.info = summaryLabel.up();
                        }
                    }
                },

                renderer: function (value, meta) {
                    if(value == undefined){
                        return;
                    }
                    var _value = null,
                        _qtipValue = null;
                    switch (meta.column.dataType) {
                        case 'int':
                            if (meta.column.colType != Grid.StringNumber){
                                _value = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                            } else {
                                _value = value;
                            }
                            meta.tdAttr = 'data-qtip="' + _value + '"';
                            return _value;
                        case 'float':
                            _value = common.Util.toFixed(value,Grid.DecimalPrecision);
                            meta.tdAttr = 'data-qtip="' + _value + '"';
                            return _value;
                        case 'date':
                            _value =   self._translateDateTime(value);
                            meta.tdAttr = 'data-qtip="' + _value + '"';
                            return _value;

                        default :
                            if (Ext.isDate(value)) {
                                _value =   self._translateDateTime(value);
                                meta.tdAttr = 'data-qtip="' + _value + '"';
                                return _value;
                            } else {
                                _value = Ext.String.htmlEncode(value);
                                _qtipValue = Ext.String.htmlEncode(_value);
                                meta.tdAttr = 'data-qtip="' + _qtipValue + '"';
                                return _value;
                            }
                    }
                }
            };

            if (aColumnType != null) {
                column['xtype'] = aColumnType;

            }

            if (aResultGrid != undefined) {
                aResultGrid.headerCt.add(column);
            } else {
                if (!self._lockAddColumns) {
                    self.pnlExTree.headerCt.add(column);
                } else {
                    self._columnsList.push(column);
                }

            }

            if (aSummaryType != undefined) {
                var summaryInfo = {
                    'dataType'   : aDataType,
                    'dataIndex'  : aDataIndex,
                    'max'        : 0,
                    'min'        : 0,
                    'total'      : 0,
                    'count'      : 0,
                    'summaryType': aSummaryType
                };
                self._summaryTreeInfoList.push(summaryInfo);
            }

            summaryInfo    = null;
            aText          = null;
            aDataIndex     = null;
            aWidth         = null;
            aDataType      = null;
            aColVisible    = null;
            aColumnHide    = null;
            aColumnType    = null;
            aResultGrid    = null;
            aSummaryType   = null;
            aColumnBGColor = null;
            column         = null;
            dataAlign      = null;
            dataType       = null;
            bgColumnColor  = null;
            aCellEditor    = null;
        };


        if (self.gridType == Grid.exGrid) {
            addGridColumn.call(this, arguments);
        } else {
            addTreeColumn.call(this, arguments);
        }

        addGridColumn = null;
        addTreeColumn = null;
    },

    summaryVisible: function(status) {
        var self = this;
        if (self.summaryArea) {
            self.summaryArea.setVisible(status);
            self.useSummary = status;
        }
    },


    addColumns: function(columns) {
        var self = this;
        for (var ix = 0, len = columns.length; ix < len; ix++) {
            self.addColumn(columns[ix][0], columns[ix][1], columns[ix][2], columns[ix][3], columns[ix][4], columns[ix][5], columns[ix][6], columns[ix][7]);
        }
    },

    findRow: function(fieldName , value) {
        var rowIndex = -1, ix, ixLen,
            gridData, rowData;

        gridData = this._localStore.rootItems;
        for(ix = 0, ixLen = gridData.length; ix < ixLen; ix++){
            rowData = gridData[ix];
            if(rowData[fieldName] == value){
                rowIndex = ix;
                break;
            }
        }

        return rowIndex;
    },

    addRow: function(rowData) {
        //self.insertRow(self._localStore.rootItems.length , rowData)
        var columnInfo = this._getColums(rowData);
        this._localStore.rootItems[this._localStore.rootItems.length] = columnInfo;

        columnInfo = null;
    },

    addRows: function (rowDataList) {
        var ix;
        for(ix =0; ix < rowDataList.length; ix++) {
            this.addRow(rowDataList[ix]);
        }
    },

    deleteRow: function(rowIndex) {
        var self = this;
        return self._localStore.rootItems.splice(rowIndex, 1);
    },

    insertRow: function(rowIndex, rowData) {
        var self = this;
        var columnInfo = this._getColums(rowData);
        self._localStore.rootItems.splice(rowIndex , 0, columnInfo);
        //this._localStore.rootItems[rowIndex] = columnInfo

        columnInfo = null;
    },

    selectByValue: function(field, value, mode) {
        var row = this.pnlExGrid.getStore().findRecord(field, value),
            isKeep = (mode)? mode : false;

        if (row) {
            this.pnlExGrid.getSelectionModel().select(row, isKeep);
        }
    },

    _getFieldIndex: function(fieldName) {
        var self   = this;
        var result = -1;
        for ( var ix = 0; ix < self._fieldInfoList.length; ix++) {
            if (fieldName === self._fieldInfoList[ix].name) {
                result = ix;
                break;
            }
        }
        return result;
    },

    _getGridType: function() {
        return self.gridType;
    },

    _getColums: function (rowData) {
        var self = this,
            gridColumns,
            ix, filedIndex;
        var columnInfo = {
            expanded   : this.nodeExpend,
            children   : [],
            childNodes : [],
            parentNode : [],
            editing    : false,
            dataindex  : 0
        };

        if (self._fieldInfoList.length == 0) {
            self._fieldInfoList = self._fieldsList;
        }

        if (self.gridType == Grid.exGrid) {
            gridColumns = self.pnlExGrid.headerCt.getGridColumns();
            for (ix = 0; ix <  gridColumns.length; ix++) {
                filedIndex = self._getFieldIndex(gridColumns[ix].dataIndex);
                columnInfo[gridColumns[ix].dataIndex] = rowData[filedIndex];
            }
        } else {
            gridColumns = self.pnlExTree.headerCt.getGridColumns();
            for (ix = 0; ix <  gridColumns.length; ix++) {
                filedIndex = self._getFieldIndex(gridColumns[ix].dataIndex);
                columnInfo[gridColumns[ix].dataIndex] = rowData[ filedIndex];
            }
        }
        return columnInfo;
    },

    clearRows: function() {
        var self = this;
        if( self.pnlExGrid == null || self.pnlExGrid.store == null || self.pnlExGrid.store.getCount() == 0){
            return;
        }

        self.pnlExGrid.getPlugin('bufferedrendererPlugin').bodyTop = 0;

//        Ext.suspendLayouts()
        self.pnlExGrid.suspendEvents();  //0320
        self.pnlExGrid.store.suspendEvents();

        self._localStore.rootItems.length = 0;
        self.pnlExGrid.store.clearData();
        self.pnlExGrid.store.removed.length = 0;
        self.pnlExGrid.getView().refresh();


        // summary 초기화. 0701
        if(self.useSummary){
            self._setGridSummary();
        }


//        self.pnlExGrid.store.removeAll()
        if (self.usePager) {
            // load 해주어야 pager 에 이전 페이지 숫자 남지 않음,.트리는 pager가 없다.
            self.pnlExGrid.store.load();
        }
        // 그리드 지우면 editmode cancel 해줌, 아닐경우 그리드만 지워지고 edit 창은 남아 있는 경우가 있음.
//        self.pnlExGrid.getPlugin('gridCellEdit').completeEdit();  // 0409

        self.pnlExGrid.store.resumeEvents();
        self.pnlExGrid.resumeEvents();   //0320
//        Ext.resumeLayouts()
    },

    clearColumns: function() {
        var self = this;
        if (this.gridType == Grid.exGrid) {
            self.pnlExGrid.headerCt.removeAll();
        } else if (self.gridType == Grid.exTree) {
            self.pnlExTree.headerCt.removeAll();
        }
        self._fieldsList.length = 0;
    },

    onData: function(aheader, adata) {
        var self = this,
            ix;
        self.clearRows();

        if(!common.Util.checkSQLExecValid(aheader, adata)){
            self.drawGrid();
            console.warn('baseGrid-onData');
            console.warn(aheader);
            console.warn(adata);
            return;
        }

        if (self._fieldsList.length == 0) {
            var columns     = adata.columns;
            var columnTypes = adata.datatype;
            var dataArray   = [];
            var makeColumnTitle;
            var columnType;

            for (ix = 0; ix < columns.length; ix++) {
                makeColumnTitle = columns[ix].replace(/_/gi, ' ').replace(/\b([a-z])/g, function($1) { return $1.toUpperCase();});
                switch (columnTypes[ix]){
                    case 'memo'   :
                    case 'string' :
                    case 'text'   :
                        columnType = Grid.String;
                        break;
                    case 'float'  :
                        columnType = Grid.Float;
                        break;
                    case 'integer':
                    case 'int64'  :
                        columnType = Grid.Number;
                        break;
                    case 'datetime' :
                        columnType = Grid.DateTime;
                        break;
                    default:
                        columnType = Grid.String;
                        break;
                }
                dataArray.push([makeColumnTitle, columns[ix], 200, columnType, true, false ]);
            }
            self.addColumns(dataArray);
        }

        for (ix = 0; ix < adata.rows.length; ix++) {
            self.addRow(adata.rows[ix]);
        }
        self.drawGrid();

    },

    showEmptyText: function() {
        if(!this.useEmptyText) {
            return;
        }

        this._grid.getView().emptyText = '<div class="x-grid-empty">'+this.emptyTextMsg+'</div>';
        this._grid.getView().refresh();
    },
    /**
    //hideEmptyText: function() {
    //    if(this.useEmptyText  == false) {return;}
    //
    //    this._grid.getView().emptyText = ' ';
    //},
    **/
    drawGrid: function() {
        var self = this;

        if (!self.pnlExGrid || !self.pnlExGrid.view) {
            return;
        }

        self.pnlExGrid.suspendEvents();

        if(self.usePager){
            self.gridStore.suspendEvents(true);
            self.gridStore.loadPage(1);
            self.gridStore.resumeEvents();
        } else {
            //self.gridStore.suspendEvents()
            self.gridStore.reload();
            //self.gridStore.resumeEvents()
            self.pnlExGrid.view.refresh();
        }


        if(self.useSummary){
            self._setGridSummary();
        }

        //Ext.suspendLayouts()
        self.pnlExGrid.resumeEvents();
        //Ext.resumeLayouts(true)

    },

    addNode: function(parentNode, nodeData) {
        var ix = null;

        try {

            var columnInfo = this._getColums(nodeData);

            if ( this.pnlExTree.store  == null) {
                this.model = Ext.create('Ext.data.Model',{
                    fields : this._fieldsList
                });
                this._treeLocalStore = Ext.create('Ext.data.TreeStore', {
                    model     : this.model,
                    proxy     : { type: 'memory' },
                    buffered  : true,
                    clearOnLoad: true,
                    sortOnLoad: false,
                    lazyFill: true
                });
                this.pnlExTree.reconfigure(this._treeLocalStore);
                this.pnlExTree.store.beginUpdate();
            } else {
                this.pnlExTree.store.beginUpdate();
            }

            if (parentNode == null) {
                columnInfo.dataindex     = (this._jsonData.children.length);
                this._jsonData.dataindex = (this._jsonData.children.length);
                this._jsonData.children.push(columnInfo);
                this._jsonData.childNodes.push(columnInfo);
            } else {
                if (parentNode) {
                    columnInfo.dataindex = ( parentNode.children.length);
                }
                columnInfo.parentNode.push(parentNode);
                parentNode.children.push(columnInfo);
                parentNode.childNodes.push(columnInfo);
            }

            if (this._summaryTreeInfoList.length > 0) {
                var fieldData = 0;
                for (ix = 0; ix < this._summaryTreeInfoList.length; ix++) {
                    fieldData = columnInfo[this._summaryTreeInfoList[ix].dataIndex];
                    if (this._summaryTreeInfoList[ix].dataType != Grid.String) {
                        this._summaryTreeInfoList[ix].max = this._summaryTreeInfoList[ix].max > fieldData ? this._summaryTreeInfoList[ix].max: fieldData ;
                        this._summaryTreeInfoList[ix].min = this._summaryTreeInfoList[ix].min < fieldData ? this._summaryTreeInfoList[ix].min: fieldData ;
                        if (fieldData == undefined) {
                            fieldData = 0;
                        }
                        this._summaryTreeInfoList[ix].total += Number(fieldData);
                    }
                    this._summaryTreeInfoList[ix].count += 1;
                }

                fieldData = null;
            }


            this.pnlExTree.store.endUpdate();
            return columnInfo;

        } finally {
            parentNode = null;
            nodeData   = null;
            columnInfo = null;
            ix         = null;
            parentNode = null;
            nodeData   = null;
        }

    },
/**
//    // 다중 find 만들어야함. 혹은 사용자가 할 것.
//    findNode: function(fieldName, compareStr) {
//        var self = this;
//        var childNodes =  self._jsonData.childNodes;
//        var searchNode = function(fieldName , compareStr, childNodes) {
//            var result = null;
//            for (var ix = 0; ix < childNodes.length; ix++) {
//                if (childNodes[ix][fieldName] == compareStr) {
//                    result = childNodes[ix];
//                    break;
//                }
//                else {
//                    if (childNodes[ix].childNodes.length > 0) {
//                        result =  searchNode(fieldName , compareStr, childNodes[ix].childNodes);
//                        if (result) {
//                            break;
//                        }
//                    }
//                }
//            }
//            return result;
//        }
//        return searchNode(fieldName , compareStr, childNodes);
//    },
**/

    // 다중 find 만들어야함. 혹은 사용자가 할 것.
    findNode: function(fieldName, compareStr, node) {

        var childNodes = null;
        try {

            if (node == undefined || node == null) {
                childNodes =  this._jsonData.childNodes;
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
        try {
            for (ix = 0; ix < childNodes.length; ix++) {
                if (childNodes[ix][fieldName] == compareStr) {
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

    MultifindNode: function(fieldName1, fieldName2, compareStr1, compareStr2, node ) {

        var childNodes = null;
        try {

            if (node == undefined || node == null) {
                childNodes =  this._jsonData.childNodes;
            } else {
                childNodes = node.childNodes;
            }

            return this.MultisearchNode(fieldName1, fieldName2, compareStr1, compareStr2, childNodes);
        } finally {
            node       = null;
            childNodes = null;
        }
    },


    MultisearchNode : function(fieldName1, fieldName2 , compareStr1, compareStr2, childNodes) {
        var result = null;
        var ix     = null;
        try {
            for (ix = 0; ix < childNodes.length; ix++) {
                if (childNodes[ix][fieldName1] == compareStr1 && childNodes[ix][fieldName2] == compareStr2 ) {
                    result = childNodes[ix];
                    break;
                }
                else {
                    if (childNodes[ix].childNodes.length > 0) {
                        result =  this.MultisearchNode(fieldName1, fieldName2 , compareStr1, compareStr2, childNodes[ix].childNodes) ;
                        if (result) {
                            break;
                        }
                    }
                }
            }
            return result;
        } finally {
            ix = null;
            childNodes = null;
            result     = null;
        }

    },


    beginTreeUpdate: function() {


//        this.pnlExTree.suspendEvents()
//        this.pnlExTree.store.suspendEvents()

        var backupJson = {
            expanded   : true,
            children   : [],
            childNodes : [],
            parentNode : [],
            editing    : false,
            dataindex  : 0
        };

        if (this._jsonData.children == undefined) {
            this._initJsonData(null, this._jsonData.childNodes, backupJson);
        }
    },

    _makedata : function (data) {
        var columnInfo = {
            expanded   : data.data.expanded,
            children   : [],
            childNodes : [],
            parentNode : [],
            editing    : false,
            dataindex  : 0
        };

        try {

            for (var ix = 0; ix < this._fieldInfoList.length; ix++) {
                columnInfo[this._fieldInfoList[ix].name] = data.data[this._fieldInfoList[ix].name];
            }

            return columnInfo;
        } finally {
            columnInfo = null;
            data = null;
        }
    },

    _addData : function(parent, data, backupJson) {
        if(parent == null){
            backupJson.childNodes.push(data);
            backupJson.children.push(data);
            backupJson.parentNode = [];
        } else {
            data.parentNode.push(parent);
            parent.childNodes.push(data);
            parent.children.push(data);
        }

    },

    _initJsonData : function(parent, data, backupJson) {
        var rowData = null;
        var ix      = null;

        for (ix = 0; ix < data.length; ix++) {
            rowData = this._makedata(data[ix]);
            this._addData(parent, rowData, backupJson);

            if (data[ix].childNodes.length > 0) {
                this._initJsonData(rowData,data[ix].childNodes);
            }
        }
        this._jsonData = null;
        this._jsonData = backupJson;
    },

    endTreeUpdate: function() {
        /**
//        Ext.resumeLayouts(true);
//        this.pnlExTree.store.resumeEvents();
//        this.pnlExTree.resumeEvents();
         **/
    },

    clearNodes : function(){
        var ix = null;

        if( !this.pnlExTree.store || !this.pnlExTree.store.getRootNode()) {
            return;
        }

        this.pnlExTree.getPlugin('bufferedrendererPlugin').bodyTop = 0;

        this.pnlExTree.suspendEvents();
        this.pnlExTree.store.suspendEvents();

        // summary 정보 초기화해주기 - 20140819 jh
        if (this._summaryTreeInfoList.length > 0 && this.useSummary) {
            for (ix = 0; ix < this._summaryTreeInfoList.length; ix++) {
                this._summaryTreeInfoList[ix].count = 0;
                this._summaryTreeInfoList[ix].max   = 0;
                this._summaryTreeInfoList[ix].min   = 0;
                this._summaryTreeInfoList[ix].total = 0;
            }

            this._setTreeSummary();
        }



        this._jsonData = null;
        this._jsonData = {
            expanded  : true,
            children  : [],
            childNodes: [],
            parentNode: [],
            editing   : false,
            dataindex : null
        };

        this.pnlExTree.store.getRootNode().removeAll();
        this.pnlExTree.store.sync();
        this.pnlExTree.getView().refresh();
/**
//        var root = self.pnlExTree.getRootNode();
//        if (root != null) {
//            while (root.childNodes.length > 0) {
//                root.removeChild(root.childNodes[0]);
//            }
//        }
//
//        self.pnlExTree.store.load();
//        self.pnlExTree.store.setRootNode(self._jsonData);
 **/
        this.pnlExTree.store.resumeEvents();
        this.pnlExTree.resumeEvents();

        ix = null;
    },

    /**
//    drawTree: function() {
//        var self = this;
//        self.pnlExTree.suspendEvents();
//        self.pnlExTree.store.suspendEvents(true);
//
//        self._jsonData = self.pnlExTree.store.setRootNode(self._jsonData);
//        self._setTreeSummary();
//
//        self.pnlExTree.store.resumeEvents();
//        self.pnlExTree.resumeEvents();
//    },


     drawTree: function() {
     //        this.pnlExTree.suspendEvents();
     //        this.pnlExTree.store.suspendEvents(true);

     this.pnlExTree.store.beginUpdate();
     this.pnlExTree.store.setRootNode(this._jsonData);

     this.pnlExTree.store.endUpdate();

     this._jsonData = null;
     this._jsonData = this.pnlExTree.getRootNode();

     if (this.useSummary == true) {
     this._setTreeSummary();
     }

     //        this.pnlExTree.store.resumeEvents();
     //        this.pnlExTree.resumeEvents();

     },
     **/

    //1502.27 (min)
    drawTree: function(){
        this.pnlExTree.suspendEvents();

        this.pnlExTree.store.setRootNode(this._jsonData);

        this._jsonData = null;
        this._jsonData = this.pnlExTree.store.getRootNode();

        if (this.useSummary) {
            this._setTreeSummary();
        }

        this.pnlExTree.resumeEvents(true);
    },

    moveNode: function(source, dest) {

        var sliceChildNodes;
        var sliceChildren;
        var index = null;
/**
//        var getIndex = function(child){
//            for(var ix = 0; ix < child.length; ix++) {
//                if(source == child[ix]){
//                    return ix;
//                }
//            }
//        };
 **/
        if (source.parentNode.length == 0) {
            index = this._getIndex(this._jsonData.childNodes, source);
            // source.dataindex  -> index  0514
            sliceChildNodes = this._jsonData.childNodes.splice(index, 1);
            sliceChildren   = this._jsonData.children.splice(index, 1);
            dest.childNodes.push(sliceChildNodes[0]);
            dest.children.push(sliceChildren[0]);

        }  else {
            sliceChildNodes = source.parentNode[0].childNodes.splice(source.dataindex, 1);
            sliceChildren   = source.parentNode[0].children.splice(source.dataindex, 1);
            dest.childNodes.push(sliceChildNodes[0]);
            dest.children.push(sliceChildren[0]);
        }

        index           = null;
        sliceChildNodes = null;
        sliceChildren   = null;
        source          = null;
        dest            = null;

    },

    _getIndex : function(child, source){
        var ix = 0;
        var resultIndex = null;
        for(ix = 0; ix < child.length; ix++) {
            if(source == child[ix]){
                resultIndex = ix;
                break;
            }
        }

        ix = null;
        child = null;
        source = null;

        return resultIndex;
    },

    /**
     * 그리드 구성 정보 저장
     *
     * @param {} gridNames
     */
    saveLayout: function(gridNames) {
        var self = this;
        var tempData = [];
        var gridColumns;
        var columnWidth;

        if (this.gridType == Grid.exGrid) {
            gridColumns = self.pnlExGrid.headerCt.getGridColumns();
        } else if (self.gridType == Grid.exTree) {
            gridColumns = self.pnlExTree.headerCt.getGridColumns();
        }

        for (var ix = 0; ix < gridColumns.length; ix++) {
            if (gridColumns[ix].flex == undefined) {
                columnWidth = gridColumns[ix].width;
            } else {
                columnWidth = gridColumns[ix].flex;
            }

            tempData.push({
                dataIndex : gridColumns[ix].dataIndex,
                width     : columnWidth,
                text      : gridColumns[ix].text,
                align     : gridColumns[ix].align,
                colvisible: gridColumns[ix].colvisible,
                columnHide: gridColumns[ix].columnHide,
                hideable  : gridColumns[ix].hideable,
                xtype     : gridColumns[ix].xtype,
                dataType  : gridColumns[ix].dataType,


                // 추가한것
                summaryType: gridColumns[ix].summaryType || null,
                tdCls      : gridColumns[ix].tdCls,
                colType    : gridColumns[ix].colType,

                // 150612 (LSM)
                textKey    : Ext.Object.getKey(window.msgMap, gridColumns[ix].text) || gridColumns[ix].text
            });
        }

        common.WebEnv.Save(gridNames, JSON.stringify(tempData));

        gridColumns = null;
        tempData    = null;

    },

    _findColumns: function(dataIndex) {
        var columnsList = this._columnsList;
        var column = null;
        var ix = null;
        var len = null;
        if (columnsList.length != 0) {
            for(ix = 0, len = columnsList.length; ix < len; ix++ ) {
                if(columnsList[ix].dataIndex == dataIndex) {
                    column = columnsList[ix];
                    break;
                }
            }
        }
        dataIndex = null;
        ix        = null;
        columnsList = null;
        len         = null;
        return column;
    },

    addRenderer: function (dataIndex , func, type) {
        var column = null;
        var ix     = null;
        var len    = null;

        if(typeof(dataIndex) == 'string'){
            column = this._findColumns(dataIndex);
            column.renderer = func;
            if(type != undefined) {
                column.rendererType = type;
            }
        } else if(Array.isArray(dataIndex)) {
            for(ix = 0, len = dataIndex.length; ix < len; ix++) {
                column = this._findColumns(dataIndex[ix]);
                column.renderer = func;
                if(type != undefined) {
                    column.rendererType = type;
                }
            }
        }

        dataIndex = null;
        func      = null;
        column    = null;
        ix        = null;
        len       = null;
    },

    _getColumnIndex : function(dataIndex, tempColumns) {
        var result = -1;
        for (var jx = 0; jx < tempColumns.length; jx++) {
            if (dataIndex == tempColumns[jx].dataIndex) {
                result = jx;
                break;
            }
        }
        tempColumns = null;
        dataIndex   = null;
        return result;
    },


    loadLayout: function(gridNames) {
        if ( Comm.web_env_info == undefined || Comm.web_env_info[gridNames] == undefined ){
            return ;
        }

        if (typeof Comm.web_env_info[gridNames] === 'object') {
            this._loadColumns(Comm.web_env_info[gridNames]);
        } else {
            this._loadColumns(JSON.parse( Comm.web_env_info[gridNames]) );
        }
    },

    _loadColumns: function(getLoadData) {
        var self = this;
        var targetGrid;

        if (this.gridType == Grid.exGrid) {
            targetGrid = self.pnlExGrid;
        } else if (self.gridType == Grid.exTree) {
            targetGrid = self.pnlExTree;
        }

        /**
        //var _getColumnIndex = function(dataIndex, tempColumns) {
        //    var result = -1;
        //    for (var jx = 0; jx < tempColumns.length; jx++) {
        //        if (dataIndex == tempColumns[jx].dataIndex) {
        //            result = jx;
        //            break;
        //        }
        //    }
        //    return result;
        //};
         **/
        self._fieldInfoList = self._fieldsList;

        if (getLoadData != null) {

            self._fieldsList = [];

            var tempHeaderCt =  targetGrid.headerCt.getGridColumns();

            var tempColumns = getLoadData,
                ix;

            if (tempHeaderCt.length > tempColumns.length) {
                var columnText = null;

                for (ix = 0; ix < tempHeaderCt.length; ix++) {
                    if (this._getColumnIndex(tempHeaderCt[ix].dataIndex, tempColumns) == -1) {
                        columnText = tempHeaderCt[ix].textKey ? common.Util.TR(tempHeaderCt[ix].textKey) : tempHeaderCt[ix].text;
                        tempColumns.push({
                            dataIndex  : tempHeaderCt[ix].dataIndex,
                            width      : tempHeaderCt[ix].width,
                            text       : columnText, //tempHeaderCt[ix].text,
                            align      : tempHeaderCt[ix].align,
                            colvisible : tempHeaderCt[ix].colvisible,
                            columnHide : tempHeaderCt[ix].columnHide,
                            hideable   : tempHeaderCt[ix].hideable,
                            dataType   : tempHeaderCt[ix].dataType,
                            summaryType: tempHeaderCt[ix].summaryType,
                            tdCls      : tempHeaderCt[ix].tdCls,
                            colType    : tempHeaderCt[ix].colType

                        });
                    }
                }
            } else {
                var LoopIndex = 0,
                    LoopCount = tempColumns.length,
                    aIndex;
                for (ix = 0; ix < LoopCount ; ix++) {
                    aIndex = this._getColumnIndex(tempColumns[LoopIndex].dataIndex, tempHeaderCt);
                    if (aIndex == -1) {
                        tempColumns.splice(LoopIndex , 1);
                    } else {
                        tempColumns[LoopIndex].text = tempHeaderCt[aIndex].textKey ? common.Util.TR(tempHeaderCt[aIndex].textKey) : tempHeaderCt[aIndex].text;
                        LoopIndex ++;
                    }
                }
                LoopIndex = null;
                LoopCount = null;
                aIndex    = null;
            }
            self.beginAddColumns();


            targetGrid.headerCt.removeAll();
            self.summaryArea.removeAll();
            self._columnsList.length = 0;
            self._summaryInfoList.length = 0;

            var dataType;
            var columnType;
            for (ix = 0; ix < tempColumns.length; ix++) {
                switch (tempColumns[ix].colType) {
                    case Grid.Number:
                        dataType =  Grid.Number;
                        break;
                    case Grid.Float:
                        dataType = Grid.Float;
                        break;
                    case Grid.String:
                        dataType =  Grid.String;
                        break;
                    case Grid.DateTime:
                        dataType = Grid.DateTime;
                        break;
                    case Grid.StringNumber:
                        dataType = Grid.StringNumber;
                        break;
                    default:
                        break;
                }
                if (this.gridType == Grid.exGrid) {
                    self.addColumn(
                      tempColumns[ix].text,
                      tempColumns[ix].dataIndex,
                      tempColumns[ix].width,
                      dataType,
                      tempColumns[ix].colvisible,
                      tempColumns[ix].columnHide,
                      tempColumns[ix].summaryType,
                      tempColumns[ix].tdCls );
                } else if (self.gridType == Grid.exTree) {
                    ix == 0  ? columnType = 'treecolumn' : columnType = '';
                    self.addColumn(
                      tempColumns[ix].text,
                      tempColumns[ix].dataIndex,
                      tempColumns[ix].width,
                      dataType,
                      tempColumns[ix].colvisible,
                      tempColumns[ix].columnHide,
                      columnType,
                      null,
                      tempColumns[ix].summaryType,
                      tempColumns[ix].tdCls );
                }
            }
            self._lockAddColumns = false;

            if (self.gridType == Grid.exGrid) {
                self.pnlExGrid.headerCt.add(self._columnsList);
            } else {
                self.pnlExTree.headerCt.add(self._columnsList);
            }
        }

    },

    getTreeDataList: function() {
        var self = this;
        var dataArr = [];

        self.pnlExTree.getRootNode().cascadeBy(function(node){
            if(node.internalId == 'root'){
                return;
            }
            dataArr.push(node);
        });
        return dataArr;
    },

    getSelectedRow: function() {
        if (this.gridType == Grid.exGrid) {
            return this.pnlExGrid.getSelectionModel().getSelection();
        } else if(this.gridType == Grid.exTree) {
            return this.pnlExTree.getSelectionModel().getSelection();
        }
    },
    setHeaderSuspandLayout: function(type) {
        Ext.suspendLayouts();
        if (type== Grid.exGrid) {
            this.pnlExGrid.headerCt.suspendEvents(true);
        } else {
            this.pnlExTree.headerCt.suspendEvents();
        }
    },
    setHeaderResumneLayout: function(type) {
        Ext.resumeLayouts(true);
        if (type== Grid.exGrid) {
            this.pnlExGrid.headerCt.resumeEvents();
        } else {
            this.pnlExTree.headerCt.resumeEvents();
        }
    },

    listeners: {
        // window에서 넘어온 column Info를 이용해서 visible true / false 상태변경해주는 listeners
        selectWindowsCallbackProc: function(columnsInfo) {
            var self = this;
            var label = '';
            var labelWidth;

            // 컬럼 summary label과 정보 모두 지우기.
            self.summaryArea.removeAll();

            self._summaryInfoList.length = 0;

            this.setHeaderSuspandLayout(self.gridType);

            for (var ix = 0; ix < columnsInfo.length; ix++) {
                var infoColumn = columnsInfo[ix];
                var targetColumn = infoColumn.targetColumn;
                if(infoColumn.checked){
                    if(targetColumn.hidden) {
                        targetColumn.colvisible = true;
                        targetColumn.show();
                    }
                    labelWidth = targetColumn.width;
                }else {
                    if(!targetColumn.hidden) {
                        targetColumn.colvisible = false;
                        targetColumn.hide();
                    }
                    // 컬럼이 hide 상태 일경우 label width = 0
                    labelWidth = 0;
                }

                if(this.useSummary) {
                    // 컬럼 summary를 다시 add 해주기.
                    label = self._addSummaryTextArea(labelWidth, columnsInfo[ix].targetColumn.dataIndex, columnsInfo[ix].targetColumn.summaryType, columnsInfo[ix].targetColumn.align,columnsInfo[ix].decimalPrecision);

                    columnsInfo[ix].targetColumn.info = label;
                }

            }

            this.setHeaderResumneLayout(self.gridType);

            if (self.gridType == Grid.exGrid) {
                if(this.useSummary) {
                    self._setGridSummary();
                }
            } else if (self.gridType == Grid.exTree && this.useSummary) {
                self._setTreeSummary();
            }


            if(self.gridName) {
                self.saveLayout(self.gridName);
            }


            self       = null;
            label      = null;
            labelWidth = null;
        },

        beforedestroy: function() {
            this.loadingMask.destroy();
            this.loadingMask = null;
            Ext.destroy(this.contextMenu);
            Ext.destroy(this.copySubItem);
        }
    }
});

//161108 수정
//Redmine #3386
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


//161117 수정
//Redmine #3460
//EXTJS-16192관련 버그로 value값도 0일 경우 if문이 동작하도록 수정한 코드.
Ext.define('Ext.patch.EXTJS-16192', {
    override : 'Ext.grid.filters.filter.TriFilter',

    activate: function (showingMenu) {
        var me = this,
            filters = me.filter,
            fields = me.fields,
            filter, field, operator, value, isRootMenuItem;

        if (me.preventFilterRemoval) {
            return;
        }

        for (operator in filters) {
            filter = filters[operator];
            field = fields[operator];
            value = filter.getValue();

            if (value || value === 0) {
                field.setValue(value);

                if (isRootMenuItem === undefined) {
                    isRootMenuItem = me.owner.activeFilterMenuItem === field.up('menuitem');
                }

                if (!isRootMenuItem) {
                    field.up('menuitem').setChecked(true, /*suppressEvents*/ true);
                }

                if (!showingMenu) {
                    me.addStoreFilter(filter);
                }
            }
        }
    },

    deactivate: function () {
        var me = this,
            filters = me.filter,
            f, filter, value;

        if (!me.countActiveFilters() || me.preventFilterRemoval) {
            return;
        }

        me.preventFilterRemoval = true;

        for (f in filters) {
            filter = filters[f];

            value = filter.getValue();
            if (value || value === 0) {
                me.removeStoreFilter(filter);
            }
        }

        me.preventFilterRemoval = false;
    },

    countActiveFilters: function () {
        var filters = this.filter,
            filterCollection = this.getGridStore().getFilters(),
            prefix = this.getBaseIdPrefix(),
            i = 0,
            filter;

        if (filterCollection.length) {
            for (filter in filters) {
                if (filterCollection.get(prefix + '-' + filter)) {
                    i++;
                }
            }
        }

        return i;
    }
});



//161201 수정
//Redmine #4083
//TypeError: 'null' is not an object (evaluating 'm.isNonData') when opening the example and press "tab" key
//EXTJS Version 5.1.1 Override
Ext.define('Ext.patch.EXTJS-14564', {
    override : 'Ext.view.Table',

    onFocusEnter: function(e) {
        var me = this,
            targetView,
            navigationModel = me.getNavigationModel(),
            lastFocused,
            focusPosition,
            br = me.bufferedRenderer,
            firstRecord,
            focusTarget;

        e = e.event;

        if (!me.cellFocused && me.all.getCount() && me.dataSource.getCount()) {
            focusTarget = e.getTarget();

            if (focusTarget && me.el.contains(focusTarget) && focusTarget !== me.el.dom && !Ext.fly(focusTarget).is(me.getCellSelector())) {
                if (navigationModel.lastFocused) {
                    navigationModel.position = navigationModel.lastFocused;
                }
                me.cellFocused = true;
            } else {
                lastFocused = focusPosition = me.getLastFocused();

                if (!focusPosition) {
                    targetView = me.isNormalView ? (me.lockingPartner.isVisible() ? me.lockingPartner : me.normalView) : me;
                    firstRecord = me.dataSource.getAt(br ? br.getFirstVisibleRowIndex() : 0);

                    if (firstRecord && !firstRecord.isNonData) {
                        focusPosition = new Ext.grid.CellContext(targetView).setPosition({
                            row: firstRecord,
                            column: 0
                        });
                    }
                }

                if (!focusPosition) {
                    e.stopEvent();
                    e.getTarget().blur();
                    return;
                }
                navigationModel.setPosition(focusPosition, null, e, null, true);

                me.cellFocused = !!navigationModel.getPosition();
            }
        }

        if (me.cellFocused) {
            me.el.dom.setAttribute('tabindex', '-1');
        }
    }
});
