Ext.define('config.config_metric_setting', {
    extend: 'Exem.Form',
    layout: { type: 'vbox', align: 'stretch' },
    width: '100%',
    height: '100%',
    bodyStyle: {
        background: '#eeeeee'
    },

    constructor: function() {
        this.callParent();
    },

    init: function(target) {
        this.target = target;

        this._baseInit();

        this._initBaseProperty();
        this._initBaseLayout();
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

        this.typeCombo = Ext.create('Exem.ComboBox', {
            store: Ext.create('Exem.Store'),
            width   : 118,
            margin: '3 5 3 6',
            listeners   : {
                change: function(me) {

                }.bind(this)
            }
        });

        this.typeCombo.addItem('os' , common.Util.TR('OS'));
        this.typeCombo.addItem('db', common.Util.TR('DB'));
        this.typeCombo.addItem('was', common.Util.TR('WAS'));

        titleArea.add(this.typeCombo);

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
                pack : 'center',
                align: 'middle'
            }
        });

        // 하단 버튼 영역
        this.okBtn = Ext.create('Exem.Button',{
            text  : common.Util.TR('Apply'),
            height: 22,
            margin : '0 5 0 0',
            width : 80 ,
            listeners: {
                scope: this,
                click: function() {
                    if(this.orderMode) {
                        //this.columnListGrid
                        this.okFn(this.hideListGrid.getStore(), this.columnListGrid.getStore());
                    } else {
                        this.okFn(this.hideListGrid.getStore());
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

        buttonArea.add(this.okBtn, this.cancelBtn);

        this.target.add(titleArea, bodyArea, buttonArea);
    },

    _initBaseProperty: function() {


    },

    _initBaseLayout: function() {
        this.defaultModel = Ext.define('editModel', {
            extend: 'Ext.data.Model',
            fields: [
                { name: 'title'    , type: 'string' },
                { name: 'dataIndex', type: 'string' }
            ]
        });

        this.leftGridStoreData = [{
            'title' : 'cpu usage',
            'dataIndex' : '22'
        }];

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
                { text: common.Util.TR('Name'), flex: 1, dataIndex: 'title' },
                { text: 'dataIndex'           , flex: 1, dataIndex: 'dataIdx', hidden: true }
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
            data    : []
        });

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
            }],
            columns: [
                { text: common.Util.TR('Name')  , flex: 1, dataIndex: 'title' },
                { text: common.Util.TR('Weight'), flex: 1, dataIndex: 'weight' },
                { text: 'dataIndex'           , flex: 1, dataIndex: 'dataIdx', hidden: true }
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

        this.rightGridArea.add(this.rightGrid);
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
        var ix, ixLen, title;
        var leftList     = this.leftGridStoreData;
        var rightList    = this.rightGridStoreData;
        var selectedList = this.leftGrid.getSelectionModel().getSelection();

        for (ix = 0, ixLen = selectedList.length; ix < ixLen; ix++) {
            title = selectedList[ix].data.title;

            leftList = leftList.filter(function(item) {
                if (item['title'] == title) {
                    rightList.push(item);
                    return false;
                }
                return true;
            }, this);
        }

        this.leftGrid.getSelectionModel().deselectAll();

        this.leftGridStoreData = leftList;
        this.leftGrid.getStore().loadData(leftList);
        this.rightGrid.getStore().loadData(rightList);
    },

    onClickMoveRightAll: function() {
        var leftList  = this.leftGridStoreData;
        var rightList = this.rightGridStoreData;

        leftList = leftList.filter(function(item) {
            rightList.push(item);
            return false;
        }, this);

        this.leftGridStoreData = leftList;
        this.leftGrid.getStore().loadData(leftList);
        this.rightGrid.getStore().loadData(rightList);
    },

    // 우측 그리드 선택 리스트 삭제.
    onClickMoveLeft: function () {
        var ix, ixLen, title;
        var leftList     = this.leftGridStoreData;
        var rightList    = this.rightGridStoreData;
        var selectedList = this.rightGrid.getSelectionModel().getSelection();

        for (ix = 0, ixLen = selectedList.length; ix < ixLen; ix++) {
            title = selectedList[ix].data.title;

            rightList = rightList.filter(function(item) {
                if (item['title'] == title) {
                    leftList.push(item);
                    return false;
                }
                return true;
            }, this);
        }

        this.rightGrid.getSelectionModel().deselectAll();

        this.rightGridStoreData = rightList;
        this.leftGrid.getStore().loadData(leftList);
        this.rightGrid.getStore().loadData(rightList);
    },

    // 우측 그리드 전체 삭제.
    onClickMoveLeftAll: function() {
        var leftList  = this.leftGridStoreData;
        var rightList = this.rightGridStoreData;

        rightList = rightList.filter(function(item) {
            leftList.push(item);
            return false;
        }, this);

        this.rightGridStoreData = rightList;
        this.rightGrid.getSelectionModel().deselectAll();
        this.leftGrid.getStore().loadData(leftList);
        this.rightGrid.getStore().loadData(rightList);
    }


});
