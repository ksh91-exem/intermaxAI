Ext.define('Exem.HListBox', {
    extend: 'Ext.container.Container',
    layout : {
        type : 'hbox',
        align: 'middle',
        pack : 'start'
    },
    height: '100%',
    width: '100%',
    itemPack : 'start',
    useScrollBtn: true, // RealTimeDiagnostics 에서 자체 스크롤 버튼 쓰기 위해 추가.
    constructor: function() {
        this.callParent(arguments);

        this.initProperty();

        this.createLayer();
        if (this.useScrollBtn) {
            this.bindEvent();
        }
    },

    initProperty: function(){
        this.slideContainer = null;
        this.slideEl = null;
        this.prev = null;
        this.next = null;
        this.totalItemWidth = 0;
        this.distance = 40;
    },

    createLayer: function(){
        this.slideContainer = Ext.create('Ext.container.Container',{
            layout : {
                type : 'hbox',
                align: this.useScrollBtn ? 'middle' : null,
                pack : this.itemPack
            },
            flex : 1,
            height: '100%',
            width: '100%',
            padding   : this.useScrollBtn ? null : '8 0 0 0',
            autoScroll: false,
            listeners: {
                scope: this,
                render : function(me){
                    this.slideEl = me.el.dom.childNodes[0].childNodes[0];
                    this.slideEl.style.marginLeft = '0px';
                }
            }
        });

        if (this.useScrollBtn) {
            this.prev = Ext.create('Ext.Button', {
                text: '<',
                hidden: true,
                listeners: {
                    scope: this,
                    click : function(me){
                        var margin = +this.slideEl.style.marginLeft.replace('px', '');
                        var offSet = margin + this.distance;

                        if(offSet >= 0){
                            offSet = 0;
                            me.hide();
                        }

                        this.next.show();

                        this.slideEl.style.marginLeft = offSet + 'px';
                    }
                }

            });

            this.next = Ext.create('Ext.Button', {
                text: '>',
                hidden: true,
                listeners: {
                    scope: this,
                    click : function(me){
                        var margin = +this.slideEl.style.marginLeft.replace('px', '');
                        var offSet = margin - this.distance;
                        var lastOffSet = this.getWidth();
                        var totalWidth = 0;

                        var items = this.slideContainer.items.items;
                        for(var ix = 0, ixLen = items.length; ix < ixLen; ix++){
                            totalWidth += items[ix].getWidth();
                        }

                        if(Math.abs(offSet) + lastOffSet >= totalWidth){
                            offSet = -(totalWidth - lastOffSet + 10);
                            me.hide();
                        }

                        this.prev.show();

                        this.slideEl.style.marginLeft = offSet + 'px';
                    }
                }
            });

            this.add([this.prev, this.slideContainer, this.next]);
        } else {

            this.add(this.slideContainer);

        }
    },

    bindEvent: function(){
        // arguments : this, width, height, oldWidth, oldHeight, eOpts
        this.addListener('resize', function(me, width) {
            var totalWidth = 0;
            var items = this.slideContainer.items.items;
            var marginLeft = +this.slideEl.style.marginLeft.replace('px', '');

            for(var ix = 0, ixLen = items.length; ix < ixLen; ix++){
                totalWidth += items[ix].getWidth();
            }

            if(totalWidth > width){
                if(+marginLeft > 0){
                    this.prev.show();
                }

                this.next.show();
            }else{
                this.prev.hide();
                this.next.hide();
                this.slideEl.style.marginLeft = '0px';
            }
        }, this);
    },

    addItem: function(item){
        this.slideContainer.add(item);
    },

    removeItem: function(item){
        this.slideContainer.remove(item);
    }
});