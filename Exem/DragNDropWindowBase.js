/**
 * Created by JONGHO on 2016-02-24.
 */
Ext.define('Exem.DragNDropWindowBase', {
    extend: 'Exem.Window',
    height: 600,
    width : 800,
    layout: 'fit',
    modal    : true,
    draggable: true,
    closable : true,
    initProperty: function() {
        this.BTNTYPE = {
            MOVE_UP          :'realign-column-moveupbtn',
            MOVE_DOWN        :'realign-column-movedownbtn',
            MOVELEFT         :'realign-column-moveleftbtn',
            MOVELEFTALL      :'realign-column-moveleftallbtn',
            MOVERIGHT        :'realign-column-moverightbtn',
            MOVERIGHTALL     :'realign-column-moverightallbtn'
        };

        this.GRIDTYPE = {
            LEFT: 0,
            RIGHT:1
        };

        this.TREETYPE = {
            LEFT: 0,
            RIGHT:1
        };
    },

    // 상단 all check 사용 여부
    useAllCheck: false,

    // reAlignColumn 에서 사용하는 컬럼 list
    columnInfo : null,

    initBase: function () {

        this.initProperty();

        var background = Ext.create('Exem.Container', {
            width : '100%',
            height: '100%',
            layout: 'vbox'
        });

        var bodyArea = Ext.create('Exem.Container', {
            width : '100%',
            height: '100%',
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

        this.add(background);

        if (this.topArea) {
            background.add(this.topArea, bodyArea, buttonArea);
        } else {
            background.add( bodyArea, buttonArea);
        }


        this.leftGridArea = Ext.create('Exem.Container', {
            height: '100%',
            flex  : 1,
            cls   : 'realign_grid_con',
            layout: 'vbox'
        });

        var centerBtnArea = Ext.create('Exem.Container', {
            width : 40,
            height: '100%',
            layout: 'vbox'
        });

        this.rightGridArea =  Ext.create('Exem.Container', {
            height: '100%',
            flex  : 1,
            cls   : 'realign_grid_con',
            layout: 'vbox'
        });


        bodyArea.add(this.leftGridArea, centerBtnArea, this.rightGridArea );

        this.init();
        this.show();

        var centerTop =  Ext.create('Exem.Container', {
            height: '100%',
            width : 40,
            flex  : 1,
            layout: {
                type : 'vbox',
                pack : 'center',
                align: 'center'

            }
        });

        centerBtnArea.add(centerTop );

        this.moveLeftBtn      = this.createImangeBtn(this.BTNTYPE.MOVELEFT, '<');
        this.moveRightBtn     = this.createImangeBtn(this.BTNTYPE.MOVERIGHT, '>');
        this.moveLeftAllBtn   = this.createImangeBtn(this.BTNTYPE.MOVELEFTALL, '<<');
        this.moveRightAllBtn  = this.createImangeBtn(this.BTNTYPE.MOVERIGHTALL, '>>');

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

        centerTop.add(
            this.moveRightBtn,
            this.moveRightAllBtn,
            { xtype: 'tbspacer', height: 15 },
            { xtype: 'container', width : '60%', height:1, cls: 'realign-column-btn-split'},
            { xtype: 'tbspacer', height: 15 },
            this.moveLeftBtn,
            this.moveLeftAllBtn
        );

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

        if(this.useDefaultBtn){
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

            buttonArea.add(this.initializeBtn, {xtype: 'tbspacer', flex: 1}, this.okBtn, this.cancelBtn);
        }
        else{
            buttonArea.add(this.okBtn, this.cancelBtn);
        }
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
        var _width  = 34, _height = 32;
        var margin = '3 0 0 0';

        switch(cls){
            case this.BTNTYPE.MOVE_UP:
            case this.BTNTYPE.MOVE_DOWN:
                _width = 18;
                _height = 18;
                margin = null;
                cls += ' disabledstate';
                break;
            default:
                break;
        }

        var btnCon = Ext.create('Exem.Button',{
            width : _width,
            height : _height,
            margin : margin,
            text : text,
            cls: cls
        });

        return btnCon;
    },

    addTitleArea: function(target, title) {
        var titleCon = Ext.create('Exem.Container',{
            width  : '100%',
            height : 30,
            padding: '0 5 0 0',
            cls    : 'base-frame-title',
            layout : this.useAllCheck ?  { type: 'hbox', pack:'end', align:'middle'} : 'fit',
            html   : '<div style = "font-size: 12px; line-height: 30px; margin-left: 10px">' + title + '</div>'
        });

        target.add(titleCon);
        return titleCon;
    },

    addAllCheckBox: function(target) {
        var allCheck =   Ext.create('Ext.form.field.Checkbox',{
            boxLabel: common.Util.TR('CheckAll'),
            itemId  : 'checkAll',
            checked : false,
            width : 70,
            margin  : '5 10 0 5'
        });
        target.add(allCheck);
        return allCheck;
    },

    addUpDownBtn: function (target, type) {
        var btnUp = this.createImangeBtn(this.BTNTYPE.MOVE_UP);
        var btnDown = this.createImangeBtn(this.BTNTYPE.MOVE_DOWN);

        target.add(btnUp, { xtype: 'tbspacer', width: 3 }, btnDown);

        if (type === 'left'){
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

        }else if (type === 'right') {
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

    createGrid : function(startGroup, isHideHeaders, isSortEnable, isAddStateCol, defaultPageSize, isAddBtn, columnOption = null) {
        var columns, gridStore, seltype, grid, bbarContainer, nextRowBtn, plugIn, btnPaddingValue, fieldOptions;

        columns = [
            {text: common.Util.TR('Name'), flex: 1, dataIndex: 'title'},
            {text: 'dataIndex', flex: 1, dataIndex: 'dataIdx', hidden: true}
        ];

        if (isAddStateCol) {
            Ext.define(startGroup, {
                extend: 'Ext.data.Model',
                fields: ['title', 'dataIdx', 'state']
            });

            columns.push({text: common.Util.TR('Learning State'), flex: 1, dataIndex: 'state'});
        } else if (columnOption) { // add additional columns
            fieldOptions = ['title', 'dataIdx'];
            for (var ix = 0, ixLen = columnOption.length; ix < ixLen; ix++) {
                fieldOptions.push(columnOption[ix].dataIndex);
            }

            Ext.define(startGroup, {
                extend: 'Ext.data.Model',
                fields: fieldOptions
            });

            columns = columns.concat(columnOption);
        } else {
            Ext.define(startGroup, {
                extend: 'Ext.data.Model',
                fields: ['title', 'dataIdx']
            });
        }

        plugIn = {
            ptype: 'bufferedrenderer',
            trailingBufferZone: defaultPageSize,
            leadingBufferZone: defaultPageSize
        };

        if (isAddBtn) {
            bbarContainer = Ext.create('Ext.container.Container',{
                layout: 'vbox',
                width : '100%',
                border: false
            });

            nextRowBtn = Ext.create('Ext.button.Button', {
                text: common.Util.TR('Next 100 Row'),
                cls: 'x-btn-config-default',
                width: 100,
                margin: '3 2 0 0',
                listeners: {
                    click: function() {
                        this.nextRowData();
                    }.bind(this)
                }
            });

            if (startGroup === 'firstGridDDGroup') {
                bbarContainer.add(nextRowBtn);
            } else {
                btnPaddingValue = '0 5 31 5';
            }
        }

        gridStore = Ext.create('Ext.data.Store', {
            model: startGroup,
            data : []
        });

        seltype = Ext.create('Ext.selection.CheckboxModel',{
            showHeaderCheckbox: false,
            ignoreRightMouseSelection: true,
            mode: 'MULTI'
        });

        grid = Ext.create('Ext.grid.Panel', {
            viewConfig : {
                plugins: {
                    ptype          : 'gridviewdragdrop',
                    containerScroll: true
                }
            },
            cls     : 'exem-realign-grid',
            selModel: seltype ,
            hideHeaders     : isHideHeaders,
            enableColumnHide: false,
            sortableColumns : isSortEnable,
            multiSelect: true,
            stripeRows : true,
            store   : gridStore,
            columns : columns,
            bbar    : bbarContainer,
            plugins : plugIn,
            flex    : 1,
            padding : (btnPaddingValue) ? btnPaddingValue : '0 5 5 5',
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

    },

    nextRowData: function() {

    }
});

