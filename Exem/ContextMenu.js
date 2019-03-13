Ext.define("Exem.ContextMenu", {
    extend: 'Ext.menu.Menu',
    alias: 'widget.basemenu',
    owner: null,
    constructor: function(config){
        this.superclass.constructor.call(this, config);
        this.itemList = [];
    },

    /**
     * 아이템 추가
     * @param param
     * type: object
     *  { title: 'title', fn : function(){}, items: [], target: object, iconCls : 'a.jpg'}
     * @param index menu index, default: last
     */
    addItem: function(param, index){
        var item = null,
            length = this.itemList.length;

        index == null ? length : index;

        if(typeof param == 'object'){
            item = Ext.create('Ext.menu.Item',{
                text: param.title,
                icon: param.icon,
                index: length,
                itemId: param.itemId,
                target: param.target,
                menu: param.items,
                listeners: {
                    click: param.fn || function(){}
                }
            });

            if(param.items){
                param.items.index = length;
            }
        }

        this.insert(index, item);

        this.itemList.splice(index, 0, item);
        return this;
    },

    getItem: function(){

    },

    /**
     * 아이템 show , hide
     * @param index 아이템 index
     * @param flag true, false
     */
    setVisibleItem: function(index, flag){
        var type = typeof index, item = null;
        if(type === 'number'){
            if(this.itemList[index]){
                this.itemList[index].setVisible(flag);
            }
        } else if(type === 'string'){
            item = this.getComponent(index);
            if(item){
                item.setVisible(flag);
            }
        }
    },

    /**
     * 아이템 enable, disable
     * @param index 아이템 index
     * @param flag true, false
     */
    setDisableItem: function(index, flag){
        var type = typeof index, item = null;
        if(type === 'number'){
            if(this.itemList[index]){
                if(flag){
                    this.itemList[index].enable(flag);
                }else{
                    this.itemList[index].disable(flag);
                }
            }
        } else if(type === 'string'){
            item = this.getComponent(index);
            if(item){
                if(flag){
                    item.enable(flag);
                }else{
                    item.disable(flag);
                }
            }
        }
    },

    /**
     * 마우스 오른쪽 클릭 시 owner 의 영역에 ContextMenu를 보여준다.
     * @param owner ContextMenu의 owner
     */
    showAtToOwner: function(owner){
        var self = this;
        this.target = owner;

        var el = owner.getEl();
        if(el){
            el.on('contextmenu', function(e){
                e.stopEvent();
                self.showAt(e.getXY());

                if (self.target.useCustomContextMenu) {
                    if (!self.target.currItem) {
                        self.setDisableItem(0, false);
                    }
                    else {
                        self.setDisableItem(0, true);
                    }
                }
            });
        }else{
            console.debug('ContextMenu:', 'element is not defined');
        }
    },

    listeners: {
        render: function(me){
            me.el.on('contextmenu', function(e){
                e.stopEvent();
            });
        },
        mouseleave: function(menu) {
            menu.hide();
        }
    }
});


/**
* @note Chrome 4x 이상에서 extjs contextmenu 의 서브 메뉴가 사라지는 버그 수정
*/
Ext.override(Ext.menu.Menu, {
    onMouseLeave: function(e) {
        var me = this;
        // BEGIN FIX
        var visibleSubmenu = false;
        me.items.each(function(item) {
            if(item.menu && item.menu.isVisible()) {
                visibleSubmenu = true;
            }
        });
        if (visibleSubmenu) {
            return;
        }

        me.deactivateActiveItem();
        if (me.disabled) {
            return;
        }
        me.fireEvent('mouseleave', me, e);
    }
});
