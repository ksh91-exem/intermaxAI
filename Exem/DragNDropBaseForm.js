/**
 * Created by Kang on 2017-07-04.
 */

Ext.define('Exem.DragNDropBaseForm', {
    extend: 'Exem.Form',
    layout: 'fit',

    useBtnType: {
        left   : true,
        right  : true,
        leftAll: true,
        rightAll:true
    },

    // 상단 all check 사용 여부
    useAllCheck: false,

    // reAlignColumn 에서 사용하는 컬럼 list
    columnInfo : null,

    _baseInit: function () {
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
    },

    _initDragNDropBaseFormLayout: function() {
        var background = Ext.create('Exem.Container', {
            width : '100%',
            height: '100%',
            layout: 'vbox'
        });

        var bodyArea = Ext.create('Exem.Container', {
            width : '100%',
            flex  : 1,
            layout: 'hbox'
        });

        var buttonArea = Ext.create('Exem.Container',{
            width  : '100%',
            height : 30,
            padding: '0 10 0 10',
            layout : {
                type : 'hbox' ,
                pack : 'center',
                align: 'middle'
            }
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

        // 하단 버튼 영역
        this.okBtn = Ext.create('Exem.Button',{
            text  : common.Util.TR('Apply'),
            height: 22,
            margin : '0 5 0 0',
            width : 80 ,
            listeners: {
                scope: this,
                click: function() {
                    this.okFn();
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

        this.initializeBtn = Ext.create('Exem.Button',{
            text   : common.Util.TR('Default'),
            height : 22,
            width  : 80 ,
            listeners: {
                scope: this,
                click: function() {
                    this.initializeData();
                }
            }
        });

        centerTop.add(
            this.moveRightBtn,
            this.moveRightAllBtn,
            { xtype: 'tbspacer', height: 15 },
            { xtype: 'container', width : '60%', height:1},
            { xtype: 'tbspacer', height: 15 },
            this.moveLeftBtn,
            this.moveLeftAllBtn
        );

        buttonArea.add(this.initializeBtn, {xtype: 'tbspacer', flex: 1}, this.okBtn, this.cancelBtn);
        centerBtnArea.add(centerTop);
        bodyArea.add(this.leftGridArea, centerBtnArea, this.rightGridArea );
        background.add(bodyArea, buttonArea);
        this.add(background);
    },

    onClickRightUp  : function() {},
    onClickRightDown: function() {},
    onClickLeftUp  : function() {},
    onClickLeftDown: function() {},
    onClickMoveLeft : function() {},
    onClickMoveRight: function() {},
    onClickMoveRightAll: function() {},
    onClickMoveLeftAll: function() {},


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

    addUpDownBtn: function (target, type) {
        var btnUp = this.createImangeBtn(this.BTNTYPE.MOVE_UP);
        var btnDown = this.createImangeBtn(this.BTNTYPE.MOVE_DOWN);

        target.add(btnUp, { xtype: 'tbspacer', width: 3 }, btnDown);

        if (type == 'left'){
            btnUp.addListener('render', function(_this){
                _this.el.on('click',function(){
                    this.onClickLeftUp();
                }.bind(this));
            }.bind(this));
            btnDown.addListener('render', function(_this){
                _this.el.on('click',function(){
                    this.onClickLeftDown();
                }.bind(this));
            }.bind(this));

        }else if (type == 'right') {
            btnUp.addListener('render', function(_this){
                _this.el.on('click',function(){
                    this.onClickRightUp();
                }.bind(this));
            }.bind(this));
            btnDown.addListener('render', function(_this){
                _this.el.on('click',function(){
                    this.onClickRightDown();
                }.bind(this));
            }.bind(this));

        }
        return {
            up: btnUp,
            down: btnDown
        };

    },



    createGrid : function( startGroup) {

        Ext.define(startGroup, {
            extend: 'Ext.data.Model',
            fields: ['title', 'dataIdx']
        });

        var gridStore = Ext.create('Ext.data.Store', {
            model: startGroup,
            data : []
        });

        var columns = [
            {text: "Column Name", flex: 1, sortable: false, dataIndex: 'title', enableColumnHide: false},
            {text: "dataIndex", flex: 1, sortable: false, dataIndex: 'dataIdx', enableColumnHide: false, hidden: true}

        ];

        var seltype = Ext.create('Ext.selection.CheckboxModel',{
            showHeaderCheckbox: false,
            ignoreRightMouseSelection: true,
            mode: 'SIMPLE'
        });

        var grid = Ext.create('Ext.grid.Panel', {
            viewConfig : {
                plugins: {
                    ptype          : 'gridviewdragdrop',
                    containerScroll: true
                }
            },
            selModel: seltype ,
            hideHeaders     : true,
            enableColumnHide: false,
            sortableColumns : false,
            multiSelect: true,
            stripeRows : true,
            store   : gridStore,
            columns : columns,
            flex    : 1,
            padding : '0 5 5 5',
            width   : '100%',
            height  : '100%'

        });



        return grid;
    },


    okFn: function() {

    },

    cancelFn: function() {
        this.close();
    },

    initializeData: function() {

    }

});

