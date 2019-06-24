/**
 * Created by JONGHO on 2016-02-24.
 */
Ext.define('Exem.MoveColumnWindow', {
    extend   : 'Exem.DragNDropWindowBase',
    title    : common.Util.TR('Align Columns'),
    layout   : 'fit',
    width    : '100%',
    height   : '100%',
    modal    : true,
    draggable: true,
    closable : true,
    focusOnToFront: true,
    orderMode : false,

    useAllCheck: true,
    useDefaultBtn: true,
    useUpDownBtn: true,

    // grid 관련 옵션
    hideGridHeaders : true,
    sortEnable      : false,
    addStateCol     : false,
    defaultPageSize : 25,
    addRowBtn       : false,

    leftGridTitle: common.Util.TR('Column List'),
    rightGridTitle: common.Util.TR('Column List'),
    leftGridDisabledMessage: common.Util.TR('Disable'),
    rightGridDisabledMessage: common.Util.TR('Disable'),
    leftGridColumnOption: null,
    rightGridColumnOption: null,

    init: function() {

        this.grid = this.target;

        this.isChangeCheckListBoxLeft  = true;
        this.isChangeCheckListBoxRight = true;

        // 좌측 그리드에 보여질 data
        this.columnListData = [];
        if (this.columnInfo) {
            this.columnListData = this.makeData();
        }

        if (this.orderMode && this.useColumnInfo) {
            this.hideListData = this.makeUseData();
        }

        this.columnListGrid = this.createGrid('firstGridDDGroup', this.hideGridHeaders, this.sortEnable, this.addStateCol, this.defaultPageSize, this.addRowBtn, this.leftGridColumnOption);
        this.hideListGrid   = this.createGrid('secondGridDDGroup', this.hideGridHeaders, this.sortEnable, this.addStateCol, this.defaultPageSize, this.addRowBtn, this.rightGridColumnOption);

        this._setRowClassByDisabled(this.columnListGrid);
        this._setRowClassByDisabled(this.hideListGrid);

        // 그리드에 data를 넣고 그리는 것보다. 나중에 load 해주는 방식이 더 빠름.
        this.columnListGrid.store.loadData(this.columnListData);
        if (this.orderMode && this.useColumnInfo) {
            this.hideListGrid.store.loadData(this.hideListData);
        }

        var columnListCon  = this.addTitleArea(this.leftGridArea , this.leftGridTitle);
        var reAlignListcon = this.addTitleArea(this.rightGridArea, this.rightGridTitle);

        // 상단 all check box
        this.leftAll = this.addAllCheckBox(columnListCon);
        this.leftAll.addListener('change', function(_this, newValue) {
            if (this.isChangeCheckListBoxLeft) {
                if (newValue) {
                    this.columnListGrid.getSelectionModel().selectAll();
                } else {
                    this.columnListGrid.getSelectionModel().deselectAll();
                }
            }
        }.bind(this));


        this.rightAll = this.addAllCheckBox(reAlignListcon);
        this.rightAll.addListener('change', function(_this, newValue) {
            if (this.isChangeCheckListBoxRight) {
                if (newValue) {
                    this.hideListGrid.getSelectionModel().selectAll();
                } else {
                    this.hideListGrid.getSelectionModel().deselectAll();
                }
            }

        }.bind(this));

        // 상단 up down button
        if (this.useUpDownBtn) {
            this.leftUpDownBtns  = this.addUpDownBtn(columnListCon, 'left');
            this.rightUpDownBtns = this.addUpDownBtn(reAlignListcon, 'right');
        }

        this.leftGridArea.add(this.columnListGrid);
        this.rightGridArea.add(this.hideListGrid);

        this.columnListGrid.getSelectionModel().on('selectionchange', function (model, sels) {
            this.isChangeCheckListBoxLeft = false;

            if (this.leftUpDownBtns) {
                if (sels.length === 0 || sels.length === this.hideListGrid.store.getCount()){
                    this.leftUpDownBtns.up.addCls('disabledstate');
                    this.leftUpDownBtns.down.addCls('disabledstate');
                } else {
                    this.leftUpDownBtns.up.removeCls('disabledstate');
                    this.leftUpDownBtns.down.removeCls('disabledstate');
                }
            }

            if (sels.length === this.columnListGrid.store.getCount()){
                this.leftAll.setValue(true);
            } else {
                this.leftAll.setValue(false);
            }

            this.isChangeCheckListBoxLeft = true;

        }, this);


        this.hideListGrid.getSelectionModel().on('selectionchange', function(model, sels) {
            this.isChangeCheckListBoxRight = false;

            if (this.rightUpDownBtns) {
                if (sels.length === 0 || sels.length === this.hideListGrid.store.getCount()) {
                    this.rightUpDownBtns.up.addCls('disabledstate');
                    this.rightUpDownBtns.down.addCls('disabledstate');
                } else {
                    this.rightUpDownBtns.up.removeCls('disabledstate');
                    this.rightUpDownBtns.down.removeCls('disabledstate');
                }
            }

            if (sels.length === this.hideListGrid.store.getCount()){
                this.rightAll.setValue(true);
            } else {
                this.rightAll.setValue(false);
            }

            this.isChangeCheckListBoxRight = true;
        }, this);
    },

    makeData: function() {
        var ix, ixLen, ix2, ix2Len, optionDataIndex, tempObj;
        var tempArr = [];
        var column, title, dataIdx, callback, name, state, disabled;

        for (ix = 0, ixLen = this.columnInfo.length; ix < ixLen; ix++){
            column = this.columnInfo[ix];
            if(!this.orderMode) {
                if(this.type === 'Group'){
                    title = column.order_group;
                    dataIdx = column.order_group;
                }
                else if(this.type === 'Agent'){
                    title = column.order_was;
                    dataIdx = column.order_wasid;
                }
                else if(this.type === 'Service'){
                    title = column.order_service;
                    dataIdx = column.order_serviceid;
                }
                else if(this.type === 'Tier'){
                    title = column.tier_id;
                    dataIdx = column.tier_id_key;
                }
                tempArr.push({title: title, dataIdx: dataIdx, idx: ix});
            } else {
                title = column.title;
                name = column.name;
                dataIdx = column.id;
                callback = column.callFn;
                state = column.state;
                disabled = column.disabled;

                tempObj = {title: title, dataIdx: dataIdx, name : name, state: state, idx: ix, callFn : callback, disabled: disabled};
                
                if (this.leftGridColumnOption) { // Option의 dataIndex를 추가
                    for (ix2 = 0, ix2Len = this.leftGridColumnOption.length; ix2 < ix2Len; ix2++) {
                        optionDataIndex = this.leftGridColumnOption[ix2].dataIndex;
                        tempObj[optionDataIndex] = column[optionDataIndex];
                    }
                }

                tempArr.push(tempObj);
            }

        }

        return tempArr;
    },

    makeUseData: function() {
        var ix, ixLen, ix2, ix2Len, optionDataIndex, tempObj;
        var tempArr = [];
        var column, title, dataIdx, callback, name, state, disabled;

        for (ix = 0, ixLen = this.useColumnInfo.length; ix < ixLen; ix++) {
            column = this.useColumnInfo[ix];
            if (!this.orderMode) {
                if (this.type === 'Group') {
                    title = column.order_group;
                    dataIdx = column.order_group;
                } else if (this.type === 'Agent') {
                    title = column.order_was;
                    dataIdx = column.order_wasid;
                } else if (this.type === 'Service') {
                    title = column.order_service;
                    dataIdx = column.order_serviceid;
                } else if (this.type === 'Tier') {
                    title = column.tier_id;
                    dataIdx = column.tier_id_key;
                }
                tempArr.push({title: title, dataIdx: dataIdx, idx: ix});
            } else {
                title = column.title;
                name = column.name;
                dataIdx = column.id;
                callback = column.callFn;
                state = column.state;
                disabled = column.disabled;

                tempObj = {title: title, dataIdx: dataIdx, name : name, state: state, idx: ix, callFn : callback, disabled: disabled};

                if (this.rightGridColumnOption) { // Option의 dataIndex를 추가
                    for (ix2 = 0, ix2Len = this.rightGridColumnOption.length; ix2 < ix2Len; ix2++) {
                        optionDataIndex = this.rightGridColumnOption[ix2].dataIndex;
                        tempObj[optionDataIndex] = column[optionDataIndex];
                    }
                }

                tempArr.push(tempObj);
            }

        }

        return tempArr;
    },

    // 위로 한칸 이동
    onClickRightUp: function() {
        // 전체가 선택된 경우에는 return
        if (this.rightAll.getValue()){
            return;
        }
        var store    = this.hideListGrid.getStore();
        var selected = [];
        Ext.each(store.data.items, function (item) {
            if( this.hideListGrid.getSelectionModel().isSelected(item)) {
                selected.push(item);
            }
        }.bind(this));


        var index;
        for (var ix = 0, leng = selected.length; ix < leng; ix++) {
            index = store.indexOf(selected[ix]);
            if (ix === 0 && index < 1) {
                break;
            }
            store.remove(selected[ix],true);
            store.insert(index-1, selected[ix]);
        }

        this.hideListGrid.getSelectionModel().select(selected);
    },

    onClickLeftUp: function() {
        if (this.leftAll.getValue()){
            return;
        }
        // 전체가 선택된 경우에는 return 해야함

        var store    = this.columnListGrid.getStore();
        var selected = [];
        Ext.each(store.data.items, function (item) {
            if (this.columnListGrid.getSelectionModel().isSelected(item)){
                selected.push(item);
            }
        }.bind(this));

        var index;
        for (var ix = 0, leng = selected.length; ix < leng; ix++){
            index = store.indexOf(selected[ix]);
            if (ix === 0 && index < 1){
                break;
            }
            store.remove(selected[ix],true);
            store.insert(index-1, selected[ix]);
        }
        this.columnListGrid.getSelectionModel().select(selected);
    },

    // 아래로 한칸 이동
    onClickLeftDown: function() {
        if (this.leftAll.getValue()){
            return;
        }
        var store    = this.columnListGrid.getStore();
        var selected = [];
        Ext.each(store.data.items, function (item) {
            if (this.columnListGrid.getSelectionModel().isSelected(item)){
                selected.unshift(item);
            }
        }.bind(this));

        var index;
        for (var ix = 0, leng = selected.length; ix<leng; ix++){
            index = store.indexOf(selected[ix]);
            if (ix === 0 && index === this.columnListGrid.store.getCount()-1){
                break;
            }
            store.remove(selected[ix],true);
            store.insert(index+1, selected[ix]);
        }

        this.columnListGrid.getSelectionModel().select(selected);
    },

    // 아래로 한칸 이동
    onClickRightDown: function() {
        if (this.rightAll.getValue()){
            return;
        }
        var store    = this.hideListGrid.getStore();
        var selected = [];
        Ext.each(store.data.items, function (item) {
            if (this.hideListGrid.getSelectionModel().isSelected(item)){
                selected.unshift(item);
            }
        }.bind(this));

        var index;
        for (var ix = 0, leng = selected.length; ix<leng; ix++){
            index = store.indexOf(selected[ix]);
            if (ix === 0 && index === this.hideListGrid.store.getCount()-1){
                break;
            }
            store.remove(selected[ix],true);
            store.insert(index+1, selected[ix]);
        }

        this.hideListGrid.getSelectionModel().select(selected);
    },

    // 우측 그리드에서 좌측으로 이동
    onClickMoveLeft : function() {
        var fromStore   = this.hideListGrid.getStore();
        var toStore     = this.columnListGrid.getStore();
        var selected    = this.hideListGrid.getSelectionModel().getSelection();
        var showMessage = false;
        for (var ix = 0, leng = selected.length; ix < leng; ix++){
            if(selected[ix].data.disabled === true) {
                this.columnListGrid.getSelectionModel().deselect(selected[ix]);
                showMessage = true;
            } else {
                fromStore.remove(selected[ix]);
                toStore.add(selected[ix]);
            }
        }

        if(!fromStore.getCount()){
            this.rightAll.setValue(false);
        }

        if(showMessage) {
            common.Util.showMessage(common.Util.TR('Warning'),  this.rightGridDisabledMessage , Ext.Msg.OK, Ext.MessageBox.WARNING);
        }
    },

    // 좌측 그리드에서 우측으로 이동
    onClickMoveRight: function() {
        var fromStore   = this.columnListGrid.getStore();
        var toStore     = this.hideListGrid.getStore();
        var selected    = this.columnListGrid.getSelectionModel().getSelection();
        var showMessage = false;
        for (var ix = 0, leng = selected.length; ix < leng; ix++){
            if(selected[ix].data.disabled === true) {
                this.columnListGrid.getSelectionModel().deselect(selected[ix]);
                showMessage = true;
            } else {
                fromStore.remove(selected[ix]);
                toStore.add(selected[ix]);
            }
        }

        if(!fromStore.getCount()){
            this.leftAll.setValue(false);
        }

        if(showMessage) {
            common.Util.showMessage(common.Util.TR('Warning'),  this.leftGridDisabledMessage , Ext.Msg.OK, Ext.MessageBox.WARNING);
        }
    },

    // 좌측 그리드에서 우측으로 이동 All
    onClickMoveRightAll: function() {
        var fromStore    = this.columnListGrid.getStore();
        var toStore      = this.hideListGrid.getStore();
        var data         = fromStore.data.items;
        var disabledData = [];
        var fromSelModel = this.columnListGrid.getSelectionModel();
        for (var ix = 0, leng = data.length; ix < leng; ix++){
            // Disabled row를 제외한 모든 data를 toStore에 추가
            if (data[ix].data.disabled === true) {
                disabledData.push(data[ix]);
                if (fromSelModel.isSelected(data[ix]) === true) {
                    fromSelModel.deselect(data[ix]);
                }
            }
            else {
                toStore.add(data[ix]);
            }
        }

        fromStore.removeAll();

        if(!fromStore.getCount()){
            this.leftAll.setValue(false);
        }

        if(disabledData.length > 0) { // Disabled row는 다시 좌측 그리드에 로드
            for (var ix = 0, leng = disabledData.length; ix < leng; ix++){
                fromStore.add(disabledData[ix]);
            }
        }
    },

    // 우측 그리드에서 좌측으로 이동 All
    onClickMoveLeftAll: function() {
        var fromStore    = this.hideListGrid.getStore();
        var toStore      = this.columnListGrid.getStore();
        var data         = fromStore.data.items;
        var disabledData = [];
        var fromSelModel = this.hideListGrid.getSelectionModel();
        for (var ix = 0, leng = data.length; ix < leng; ix++){
            // Disabled row를 제외한 모든 data를 toStore에 추가
            if (data[ix].data.disabled === true) {
                disabledData.push(data[ix]);
                if (fromSelModel.isSelected(data[ix]) === true) {
                    fromSelModel.deselect(data[ix]);
                }
            }
            else {
                toStore.add(data[ix]);
            }
        }

        fromStore.removeAll();

        if(!fromStore.getCount()){
            this.rightAll.setValue(false);
        }

        if(disabledData.length > 0) { // Disabled row는 다시 우측 그리드에 로드
            for (var ix = 0, leng = disabledData.length; ix < leng; ix++){
                fromStore.add(disabledData[ix]);
            }
        }
    },

    okFn: function() {
        if (this._reAlignColumns()) {
            this.close();
        }
    },

    _reAlignColumns: function() {
        var targetGrid;
        var columnListLength;
        var columnListOri;

        if (this.grid.gridType == Grid.exGrid) {
            targetGrid = this.grid.pnlExGrid;
            columnListOri    = targetGrid.getView().getHeaderCt().getVisibleGridColumns();
            columnListLength = columnListOri.length;
        } else if (this.grid.gridType == Grid.exTree) {
            targetGrid = this.grid.pnlExTree;
            columnListOri    = targetGrid.getView().getHeaderCt().getVisibleGridColumns();
            columnListLength = columnListOri.length;
        } else {
            targetGrid = this.grid.baseGrid;
            columnListOri    = targetGrid.getView().getHeaderCt().getVisibleGridColumns();
            columnListLength = columnListOri.length;
            if (this.grid.useCheckBox === true) {
                columnListLength  -= 1;
            }
        }

        var columnreAlinList    = this._getReAlignList() ;

        if (columnListLength !== columnreAlinList.length) {
            common.Util.showMessage(common.Util.TR('Warning'),  common.Util.TR('Please fill realign column list') , Ext.Msg.OK, Ext.MessageBox.WARNING);
            return false;
        }


        this.grid.setHeaderSuspandLayout(this.grid.gridType);

        // reordering
        // 보이는 컬럼을 맨 앞으로 이동.
        var tempItems    = null;
        var headerCt     = targetGrid.getView().getHeaderCt().columnManager.headerCt;
        var targetColumn = null;
        if (this.grid.useCheckBox === true){
            tempItems    =  headerCt.items[0];
        }
        for (var jx = 0, leng = columnreAlinList.length; jx < leng; jx++){
            targetColumn = this._findColumns(targetGrid, columnreAlinList[jx]);
            headerCt.move(targetColumn, tempItems);
            tempItems = targetColumn;
        }

        this.grid.setHeaderResumneLayout(this.grid.gridType);

        // view 를 갱신 해주어야 data 맞게 보여짐.
        targetGrid.getView().refresh();

        // 컬럼 이동 정보 저장.
        if (this.grid.gridName && this.grid.gridName !== ''){
            this.grid.saveLayout(this.grid.gridName);
        }

        return true;

    },

    _findColumns: function(targetGrid, dataIndex) {

        var columnsList = targetGrid.headerCt.getGridColumns();
        var column      = null;
        var ix;
        var len;
        if (columnsList.length !== 0) {
            for (ix = 0, len = columnsList.length; ix < len; ix++ ) {
                if (columnsList[ix].dataIndex == dataIndex) {
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

    _getReAlignList: function() {
        var tempList = this.hideListGrid.getStore().data.items;
        var tempArr  = [];
        for (var ix = 0, leng = tempList.length; ix < leng; ix++){
            if (tempList[ix].data.columnHide) {
                continue;
            }
            tempArr.push(tempList[ix].data.dataIdx);
        }
        return tempArr;
    } ,

    initializeData: function() {
        this.columnListGrid.store.loadData(this.columnListData);
        this.hideListGrid.store.loadData([]);
        this.leftAll.setValue(false);
        this.rightAll.setValue(false);
    },

    _setRowClassByDisabled: function(targetGrid) {
        targetGrid.getView().getRowClass = function(record) {
            var cls;

            if (record.data.disabled === true) {
                cls = 'grid-panel-row-disabled';
            }
            return cls;
        }.bind(this);
    }

});