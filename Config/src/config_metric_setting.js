Ext.define('config.config_metric_setting', {
    extend: 'Exem.Form',
    layout: { type: 'vbox', align: 'stretch' },
    width: '100%',
    height: '100%',
    bodyStyle: {
        background: '#eeeeee'
    },
    isDataLoading: false,
    loadedLeftGridStoreData: [],
    loadedRightGridStoreData: [],

    constructor: function() {
        this.callParent();
    },

    init: function(target) {
        this.target = target;

        this._baseInit();

        this._initBaseProperty();
        this._initBaseLayout();
        this._initDataSetting();
    },

    _baseInit: function() {
        this._initDragNDropBaseFormProperty();
        this._initDragNDropBaseFormLayout();
    },

    _initDragNDropBaseFormProperty: function() {
        this.BTNTYPE = {
            MOVE_UP      :'realign-column-moveupbtn',
            MOVE_DOWN    :'realign-column-movedownbtn',
            MOVELEFT     :'realign-column-moveleftbtn',
            MOVELEFTALL  :'realign-column-moveleftallbtn',
            MOVERIGHT    :'realign-column-moverightbtn',
            MOVERIGHTALL :'realign-column-moverightallbtn'
        };

        this.useBtnType = {
            left   : true,
            right  : true,
            leftAll: true,
            rightAll:true
        };

        this.leftGridStoreData  = [];
        this.rightGridStoreData = [];
    },

    _initDragNDropBaseFormLayout: function() {
        var titleArea = Ext.create('Exem.Container', {
            width : '100%',
            height : '50px',
            layout: 'hbox',
            margin: '3 5 3 0'
        });

        var systemLabel = common.Util.TR('System') + ' :',
            instanceLabel = common.Util.TR('Instance') + ' :',
            tm = new Ext.util.TextMetrics(),
            systemLabelLength = tm.getWidth(systemLabel),
            instanceLabelLength = tm.getWidth(instanceLabel);

        this.systemTypeCombo = Ext.create('Exem.ComboBox', {
            store: Ext.create('Exem.Store'),
            width   : 118 + systemLabelLength,
            margin: '3 5 3 6',
            fieldLabel: systemLabel,
            labelAlign: 'right',
            labelWidth: systemLabelLength,
            listeners   : {
                change: function(me) {
                    this.onSystemIdChange();
                }.bind(this)
            }
        });

        this.instanceTypeCombo = Ext.create('Exem.ComboBox', {
            store: Ext.create('Exem.Store'),
            width   : 118 + instanceLabelLength,
            margin: '3 5 3 6',
            fieldLabel: instanceLabel,
            labelAlign: 'right',
            labelWidth: instanceLabelLength,
            listeners   : {
                change: function(me) {
                    this.executeSQL();
                }.bind(this)
            }
        });

        this.instanceTypeCombo.addItem('os' , common.Util.TR('OS'));
        this.instanceTypeCombo.addItem('db', common.Util.TR('DB'));
        this.instanceTypeCombo.addItem('was', common.Util.TR('WAS'));

        titleArea.add(this.systemTypeCombo, this.instanceTypeCombo);

        var bodyArea = Ext.create('Exem.Container', {
            width : '100%',
            flex  : 1,
            layout: 'hbox'
        });

        this.leftGridArea = Ext.create('Exem.Container', {
            flex  : 1,
            height: '100%',
            layout: 'vbox'
        });

        var centerTop =  Ext.create('Exem.Container', {
            width : '100%',
            height: '100%',
            flex  : 1,
            layout: {
                type : 'vbox',
                pack : 'center',
                align: 'center'

            }
        });

        this.rightGridArea =  Ext.create('Exem.Container', {
            flex  : 1,
            height: '100%',
            layout: 'vbox'
        });

        var centerBtnArea = Ext.create('Exem.Container', {
            width : 40,
            height: '100%',
            layout: 'fit'
        });

        this.moveLeftBtn      = this.createImangeBtn(this.BTNTYPE.MOVELEFT, '<');
        this.moveRightBtn     = this.createImangeBtn(this.BTNTYPE.MOVERIGHT, '>');
        this.moveLeftAllBtn   = this.createImangeBtn(this.BTNTYPE.MOVELEFTALL, '<<');
        this.moveRightAllBtn  = this.createImangeBtn(this.BTNTYPE.MOVERIGHTALL, '>>');

        if(!this.useBtnType.left) {
            this.moveLeftBtn.setVisible(false);
        }
        if(!this.useBtnType.right) {
            this.moveRightBtn.setVisible(false);
        }
        if(!this.useBtnType.leftAll) {
            this.moveLeftAllBtn.setVisible(false);
        }
        if(!this.useBtnType.rightAll) {
            this.moveRightAllBtn.setVisible(false);
        }

        this.moveLeftBtn.addListener('render', function(_this){
            _this.el.on('click',function(){
                this.onClickMoveLeft();
            }.bind(this));
        }.bind(this));
        this.moveRightBtn.addListener('render', function(_this){
            _this.el.on('click',function(){
                this.onClickMoveRight();
            }.bind(this));
        }.bind(this));

        this.moveLeftAllBtn.addListener('render', function(_this){
            _this.el.on('click',function(){
                this.onClickMoveLeftAll();
            }.bind(this));
        }.bind(this));

        this.moveRightAllBtn.addListener('render', function(_this){
            _this.el.on('click',function(){
                this.onClickMoveRightAll();
            }.bind(this));
        }.bind(this));

        centerTop.add([this.moveRightBtn, this.moveRightAllBtn, { xtype: 'tbspacer', height: 15 }, { xtype: 'container', width : '60%', height:1}, { xtype: 'tbspacer', height: 15 }, this.moveLeftBtn, this.moveLeftAllBtn]);

        centerBtnArea.add(centerTop);
        bodyArea.add(this.leftGridArea, centerBtnArea, this.rightGridArea);

        var buttonArea = Ext.create('Exem.Container',{
            width  : '100%',
            height : 30,
            padding: '0 10 10 6',
            layout : {
                type : 'hbox' ,
                pack : 'begin',
                align: 'middle'
            }
        });

        var addButtonCon = Ext.create('Exem.Container',{
            width  : 30,
            height : 30,
            padding: '0 0 0 0',
            layout : {
                type : 'vbox' ,
                pack : 'center',
                align: 'begin'
            }
        });

        var saveButtonCon = Ext.create('Exem.Container',{
            flex   : 1,
            height : 30,
            padding: '0 0 0 0',
            layout : {
                type : 'hbox' ,
                pack : 'center',
                align: 'middle'
            }
        });

        // 하단 버튼 영역
        this.addBtn = Ext.create('Exem.Button',{
            text  : '<img src="../images/cfg_add.png" width="15" height="15">',
            height: 22,
            width : 28 ,
            listeners: {
                scope: this,
                click: function() {
                    this.onButtonClick('Add');
                }
            }
        });
        this.okBtn = Ext.create('Exem.Button',{
            text  : common.Util.TR('Apply'),
            height: 22,
            margin : '0 5 0 -30',
            width : 80 ,
            listeners: {
                scope: this,
                click: function() {
                    if(this.isDataLoading) {
                        Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('ERROR'));
                    } else {
                        this.save();
                    }

                }
            }
        });
        this.cancelBtn = Ext.create('Exem.Button',{
            text   : common.Util.TR('Cancel'),
            height : 22,
            width  : 80,
            listeners: {
                scope: this,
                click: function() {
                    this.cancelFn();
                }
            }
        });

        addButtonCon.add(this.addBtn);
        saveButtonCon.add(this.okBtn, this.cancelBtn);
        buttonArea.add(addButtonCon, saveButtonCon);

        this.target.add(titleArea, bodyArea, buttonArea);
    },

    _initDataSetting: function() {
        this.setSystemCombo();
    },

    _initBaseProperty: function() {


    },

    _initBaseLayout: function() {
        this.defaultModel = Ext.define('editModel', {
            extend: 'Ext.data.Model',
            fields: [
                { name: 'metric_id', type: 'string' },
                { name: 'use_type' , type: 'string' },
                { name: 'weight'   , type: 'string' },
                { name: 'desc'     , type: 'string' },
                { name: 'dataIndex', type: 'string' }
            ]
        });

        var leftStore = Ext.create('Ext.data.Store', {
            model   : this.defaultModel,
            data    : this.leftGridStoreData
        });

        this.leftGrid = Ext.create('Ext.grid.Panel', {
            width       : '100%',
            flex        : 1,
            hideHeaders : false,
            forceFit    : true,
            autoScroll  : true,
            border      : true,
            margin      : '3 10 10 6',
            store       : leftStore,
            style       : 'border : #fff',
            cls         : 'exem-statChange-grid',
            plugins: [{
                // 스크롤 위치에서 보여줄 몇 개의 레코드만 스토어로부터 버퍼링하여 로딩 속도 높임.
                ptype: 'bufferedrenderer',
                trailingBufferZone: 20,    // 현재 렌더링된 스크롤 밑으로 버퍼링할 레코드 갯수
                leadingBufferZone : 20      // 스크롤 위쪽
            }],
            columns: [
                { text: common.Util.TR('Name')       , flex: 1, dataIndex: 'metric_id' },
                { text: common.Util.TR('isUsed')   , flex: 1, dataIndex: 'use_type' , hidden: true, renderer: this.renderUseType },
                { text: common.Util.TR('Description'), flex: 1, dataIndex: 'desc' },
                { text: 'sys_id'                     , flex: 1, dataIndex: 'sys_id'   , hidden: true },
                { text: common.Util.TR('Instance')   , flex: 1, dataIndex: 'inst_type', hidden: true },
                { text: 'dataIndex'                  , flex: 1, dataIndex: 'dataIndex', hidden: true }
            ],
            viewConfig : {
                plugins: {
                    ptype          : 'gridviewdragdrop',
                    containerScroll: true,
                    enableDrag     : false,
                    enableDrop     : false
                }
            },
            selModel : Ext.create('Ext.selection.CheckboxModel',{
                showHeaderCheckbox: false,
                ignoreRightMouseSelection: true,
                mode: 'SIMPLE'
            }),
            bodyStyle: { cursor: 'pointer' },
            listeners: {
                cellcontextmenu: function(me, td, cellIndex, record, tr, rowIndex, e ) {
                    e.stopEvent();
                }.bind(this)
            }
        });

        this.leftGridArea.add(this.leftGrid);

        var rightStore = Ext.create('Ext.data.Store', {
            model   : this.defaultModel,
            data    : this.rightGridStoreData
        });

        var cellEdit = Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 1
        })

        var weightEditOption = { xtype: 'numberfield', readOnly: false, minValue: 1, maxValue: 3 };

        this.rightGrid = Ext.create('Ext.grid.Panel', {
            width       : '100%',
            flex        : 1,
            hideHeaders : false,
            forceFit    : true,
            autoScroll  : true,
            border      : true,
            margin      : '3 10 10 6',
            store       : rightStore,
            style       : 'border : #fff',
            cls         : 'exem-statChange-grid',
            plugins: [{
                // 스크롤 위치에서 보여줄 몇 개의 레코드만 스토어로부터 버퍼링하여 로딩 속도 높임.
                ptype: 'bufferedrenderer',
                trailingBufferZone: 20,    // 현재 렌더링된 스크롤 밑으로 버퍼링할 레코드 갯수
                leadingBufferZone : 20      // 스크롤 위쪽
            }, cellEdit],
            columns: [
                { text: common.Util.TR('Name')       , flex: 1, dataIndex: 'metric_id' },
                { text: common.Util.TR('isUsed')   , flex: 1, dataIndex: 'use_type' , hidden: true, renderer: this.renderUseType },
                { text: common.Util.TR('Weight')     , flex: 1, dataIndex: 'weight'   , xtype: 'gridcolumn', editor: weightEditOption, renderer: this.renderWeight },
                { text: common.Util.TR('Description'), flex: 1, dataIndex: 'desc' },
                { text: 'sys_id'                     , flex: 1, dataIndex: 'sys_id'   , hidden: true },
                { text: common.Util.TR('Instance')   , flex: 1, dataIndex: 'inst_type', hidden: true },
                { text: 'dataIndex'                  , flex: 1, dataIndex: 'dataIndex', hidden: true }
            ],
            viewConfig : {
                plugins: {
                    ptype          : 'gridviewdragdrop',
                    containerScroll: true,
                    enableDrag     : false,
                    enableDrop     : false
                }
            },
            selModel : Ext.create('Ext.selection.CheckboxModel',{
                showHeaderCheckbox: false,
                ignoreRightMouseSelection: true,
                mode: 'SIMPLE'
            }),
            bodyStyle: { cursor: 'pointer' },
            listeners: (function(){
                var editing, ix, ixLen, lastDeselection, isEditColumnClicked;
                
                return {
                    beforeselect: function(me, record, index, eOpts) {
                        if (record.data.use_type == 2){
                            return false;
                        }
                        return !editing;
                    },
                    beforeedit: function(editor, e) {
                        var grid = e.grid,
                            record = e.record,
                            selections = grid.getSelectionModel().getSelection();
                        
                        if (record.data.use_type == 2){ // 필수 지표는 편집 불가
                            return false;
                        }

                        if (lastDeselection == record && isEditColumnClicked) { // 선택된 row 편집 시 select 전체 해제되는 현상 방지
                            selections.push(record)
                            grid.getSelectionModel().select(selections)
                            return true;
                        }
                        
                        editing = true;
                    },
                    edit: function() {
                        editing = false;
                    },
                    canceledit: function() {
                        editing = false;
                    },
                    deselect: function(me, record, eOpts) {
                        lastDeselection = record;
                    },
                    cellclick: function (me, rowIndex, columnIndex, record) {
                        if (columnIndex == 3){
                            isEditColumnClicked = true;
                        } else {
                            isEditColumnClicked = false;
                        }
                    }.bind(this),
                    cellcontextmenu: function(me, td, cellIndex, record, tr, rowIndex, e ) {
                        e.stopEvent();
                    }.bind(this)
                }
            }())
        });

        this.rightGridArea.add(this.rightGrid);

        this.setRowClassByUseType();
    },

    renderUseType: function(val) {
        var useTypeSet = ["0 : 미사용", "1 : 사용", "2 : 필수"],
            useTypeValue = [0, 1, 2],
            ix, ixLen;
        
        for (ix = 0, ixLen = useTypeSet.length; ix < ixLen; ix++) {
            if (val == useTypeValue[ix]) {
               val = useTypeSet[ix];
            }
        }

        return val;
    },

    renderWeight: function(val) {
        var weightSet = ["1 : 낮음", "2 : 중간", "3 : 높음"],
            weightValue = [1, 2, 3],
            ix, ixLen;
        
        for (ix = 0, ixLen = weightSet.length; ix < ixLen; ix++) {
            if (val == weightValue[ix]) {
                val = weightSet[ix];
            }
        }

        return val;
    },

    setSystemCombo: function() {
        var data,
            ix, ixLen;

        Ext.Ajax.request({
            url : common.Menu.useGoogleCloudURL + '/admin/system',
            method : 'GET',
            success : function(response) {
                var result = Ext.JSON.decode(response.responseText);
                if (result.success === true) {
                    data = result.data;

                    for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
                        this.systemTypeCombo.addItem(data[ix].sys_id, data[ix].name);
                    }

                    this.systemTypeCombo.selectRow(0);
                }
            }.bind(this),
            failure : function(){}
        });
    },

    onSystemIdChange: function() {
        var self = this,
            instanceType;
        instanceType = self.instanceTypeCombo.getValue();

        if (instanceType == 'was') {
            self.executeSQL();
        }
        else {
            self.instanceTypeCombo.selectRow(0);
        }
    },

    executeSQL: function() {
        var self = this,
            ix, ixLen, data, record, systemID, instanceType;
        var leftList = [];
        var rightList = [];

        systemID = self.systemTypeCombo.getValue();
        instanceType = self.instanceTypeCombo.getValue();

        if (systemID === undefined) {
            console.log("systemID undefined.")
            return;
        }

        self.isDataLoading = true;

        Ext.Ajax.request({
            url : common.Menu.useGoogleCloudURL + '/admin/system/' + systemID + '/metric/' + instanceType,
            method : 'GET',
            success : function(response) {
                var result = Ext.JSON.decode(response.responseText);
                if (result.success === true) {
                    data = result.data;
                    
                    for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
                        record = data[ix];
                        record.dataIndex = ix;

                        if (data[ix].use_type == 0) { 
                            leftList.push(record);
                        }
                        else {
                            rightList.push(record);
                        }
                    }

                    rightList = self.sortRightGridList(rightList);

                    self.loadedLeftGridStoreData = $.extend(true, [], leftList);
                    self.loadedRightGridStoreData = $.extend(true, [], rightList);
                    self.leftGridStoreData = leftList;
                    self.rightGridStoreData = rightList;
                    self.leftGrid.getStore().loadData(leftList);
                    self.rightGrid.getStore().loadData(rightList);
                    
                    self.isDataLoading = false;
                }
            },
            failure : function(){
                self.isDataLoading = false;
            }
        });
    },

    save : function () {
        var self = this,
            data = [],
            ix, ixLen, record, systemID, instanceType;    
        var allStoreData = self.leftGridStoreData.concat(self.rightGridStoreData);

        systemID = self.systemTypeCombo.getValue();
        instanceType = self.instanceTypeCombo.getValue();

        for (ix = 0, ixLen = allStoreData.length; ix < ixLen; ix++) {
            record = {
                metric_id: allStoreData[ix].metric_id,
                use_type: allStoreData[ix].use_type,
                weight: allStoreData[ix].weight,
                desc: allStoreData[ix].desc,
            };
            data.push(record);
        }

        Ext.Ajax.request({
            url : common.Menu.useGoogleCloudURL + '/admin/system/' + systemID + '/metric/' + instanceType,
            method : 'POST',
            params : JSON.stringify(data),
            success : function(response) {
                var result = Ext.JSON.decode(response.responseText);

                if (result.success === true) {
                    self.executeSQL();
                    Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
                } else {
                    console.error(result.message);
                }
            },
            failure : function(){}
        });
    },

    cancelFn : function () {
        this.leftGrid.getSelectionModel().deselectAll();
        this.rightGrid.getSelectionModel().deselectAll();
        this.leftGridStoreData = $.extend(true, [], this.loadedLeftGridStoreData);
        this.rightGridStoreData = $.extend(true, [], this.loadedRightGridStoreData);
        this.leftGrid.getStore().loadData(this.leftGridStoreData);
        this.rightGrid.getStore().loadData(this.rightGridStoreData);
    },

    onButtonClick: function(cmd) {
        var self = this,
            metricForm;

        switch (cmd) {
            case 'Add' :
                metricForm = Ext.create('config.config_metric_form');
                metricForm.parent = self;
                metricForm.systemID = self.systemTypeCombo.getValue();
                metricForm.instanceType = self.instanceTypeCombo.getValue();
                metricForm.init('Add');
                break;
            default :
                break;
        }
    },

    createImangeBtn: function(cls, text){
        var _width  = 28;
        var _height = 26;

        switch(cls){
            case this.BTNTYPE.MOVE_UP:
            case this.BTNTYPE.MOVE_DOWN:
                _width = 18;
                _height = 17;
                cls += ' disabledstate';
                break;
            default :
                break;
        }
        var btnCon = Ext.create('Exem.Button',{
            width : _width,
            height: _height,
            margin: '3 0 0 0',
            text : text,
            cls: cls
        });

        return btnCon;
    },

    // 좌측 그리드에서 우측으로 이동
    onClickMoveRight: function() {
        var ix, ixLen, metricId;
        var leftList     = this.leftGridStoreData;
        var rightList    = this.rightGridStoreData;
        var selectedList = this.leftGrid.getSelectionModel().getSelection();

        for (ix = 0, ixLen = selectedList.length; ix < ixLen; ix++) {
            metricId = selectedList[ix].data.metric_id;

            leftList = leftList.reduce((queue, current, index) => {
                if (current['metric_id'] == metricId) {
                    current.use_type = 1;
                    rightList.push(current);
                    return queue;
                } 
                else {
                    queue.push(current);
                    return queue;
                }
            }, []);
        }

        rightList = this.sortRightGridList(rightList);

        this.leftGrid.getSelectionModel().deselectAll();

        this.leftGridStoreData = leftList;
        this.leftGrid.getStore().loadData(leftList);
        this.rightGrid.getStore().loadData(rightList);
    },

    onClickMoveRightAll: function() {
        var leftList  = this.leftGridStoreData;
        var rightList = this.rightGridStoreData;

        leftList = leftList.reduce((queue, current, index) => {
            current.use_type = 1;
            rightList.push(current);
            return queue;
        }, []);

        rightList = this.sortRightGridList(rightList);

        this.leftGridStoreData = leftList;
        this.leftGrid.getStore().loadData(leftList);
        this.rightGrid.getStore().loadData(rightList);
    },

    // 우측 그리드 선택 리스트 삭제.
    onClickMoveLeft: function () {
        var ix, ixLen, metricId;
        var leftList     = this.leftGridStoreData;
        var rightList    = this.rightGridStoreData;
        var selectedList = this.rightGrid.getSelectionModel().getSelection();

        for (ix = 0, ixLen = selectedList.length; ix < ixLen; ix++) {
            metricId = selectedList[ix].data.metric_id;

            rightList = rightList.reduce((queue, current, index) => {
                if(current.use_type == 2) {
                    queue.push(current);
                    return queue;
                }
                if (current['metric_id'] == metricId) {
                    current.use_type = 0;
                    leftList.push(current);
                    return queue;
                } 
                else {
                    queue.push(current);
                    return queue;
                }
            }, []);
        }

        rightList = this.sortRightGridList(rightList);

        this.rightGrid.getSelectionModel().deselectAll();

        this.rightGridStoreData = rightList;
        this.leftGrid.getStore().loadData(leftList);
        this.rightGrid.getStore().loadData(rightList);
    },

    // 우측 그리드 전체 삭제.
    onClickMoveLeftAll: function() {
        var leftList  = this.leftGridStoreData;
        var rightList = this.rightGridStoreData;

        rightList = rightList.reduce((queue, current, index) => {
            if(current.use_type == 2) {
                queue.push(current);
                return queue;
            }
            current.use_type = 0;
            leftList.push(current);
            return queue;
        }, []);
        
        rightList = this.sortRightGridList(rightList);

        this.rightGridStoreData = rightList;
        this.rightGrid.getSelectionModel().deselectAll();
        this.leftGrid.getStore().loadData(leftList);
        this.rightGrid.getStore().loadData(rightList);
    },

    sortRightGridList: function(dataList) {
        dataList.sort((a, b) => {
            return a.use_type - b.use_type;
        })
        return dataList;
    },

    setRowClassByUseType: function() {
        this.rightGrid.getView().getRowClass = function(record) {
            var cls;
            var useType = record.data.use_type;

            if (useType == 2) { // use type 2 : 필수 지표
                cls = 'grid-panel-row-disabled';
            }
            return cls;
        }.bind(this);
    },

    changeMetricInfo: function(record) {
        var leftList  = this.leftGridStoreData;
        var rightList = this.rightGridStoreData;

        if (record.use_type == 0) {
            leftList.push(record);
            this.leftGridStoreData = leftList;
        } else if (record.use_type == 1) {
            rightList.push(record);
            this.rightGridStoreData = rightList;
        }

        this.leftGrid.getStore().loadData(leftList);
        this.rightGrid.getStore().loadData(rightList);
    },


});
