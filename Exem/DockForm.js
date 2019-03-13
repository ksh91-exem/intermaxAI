Ext.define("Exem.DockForm", {
    extend      : 'Exem.Container',
    alias       : 'widget.dockform',
    layout      : 'fit',
    type        : 'dock',
    flex        : 1,
    width       : '100%',
    height      : '100%',
    floatingLayer : false,                  // layer의 현재 상태 (true : 떠있는 상태, false : 붙어있는 상태)
    isDockFrame : true,
    cls         : 'dockform',

    isExpand   : false,
    _isDragging: false,
    _fisrtLayoutFlag: true,
    showToolMenu: false,
    toolMenuFn: null,


    constructor: function() {
        this.callParent(arguments);

        if(this.isDockFrame){
            this.initEvent();
        }
    },

    initEvent: function(){

        this.addListener('afterlayout', function(){
            if(this._fisrtLayoutFlag){
                this.$target = $('#' + this.id);
                this.createMoveDirection();
                this.dockEventBinding();
                this.createDockTool();
                this._fisrtLayoutFlag = false;
            }
        });

        this.addListener('resize', function(){
            if(! this.$target) {
                return;
            }

            var pOffSet = this.$target.offset();

            this.$direct.css({
                top: pOffSet.top + (this.$target.height() / 2) - (this.$direct.height() / 2),
                left: pOffSet.left  + (this.$target.width() / 2) - (this.$direct.width() / 2)
            });

            pOffSet = null;
        });

        this.addListener('destroy', function(){
            if(this.$headerTool){
                this.$headerTool.remove();
            }

            if(this.$direct){
                this.$direct.remove();
            }

            if(this.$hiddenLayer){
                this.$hiddenLayer.remove();
            }

            if(this.dockContainer && this.dockContainer.removeDockList){
                this.dockContainer.removeDockList(this);
            }

            delete this.dockContainer;

            this.$target.remove();
            this.$target = null;
        });

        this.addListener('move', function(){
            //화면 잠금상태인 경우
            if (!window.isLockRTMFrame && this.$headerTool) {
                this.$headerTool.hide();
            }
        });
    },

    dockEventBinding: function(){
        if(this.isExpand){
            return;
        }

        this.$target.hover(function(e){
            e.stopPropagation();

            //화면 잠금상태인 경우
            if (window.isLockRTMFrame) {
                return;
            }

            // 기존 레이어에서 벗어난 상태일 경우
            if(! this.floatingLayer && $('.xm-dragging').length == 0){
                clearTimeout(this.headerTimer);

                var offSet = $(this.el.dom).offset();
                var width = this.getWidth();

                this.$headerTool.css({
                    top: offSet.top - 25,
                    left: offSet.left + width - 120
                });

                this.$headerTool.show();

                offSet = null;
            }

            clearTimeout(this.headerTimer);
            this.headerTimer = setTimeout(function(){
                if (this.headerTimer != null) {
                    this.$headerTool.hide();
                }
            }.bind(this), 1500);

        }.bind(this), function(e){
            e.stopPropagation();

            //화면 잠금상태인 경우
            if (window.isLockRTMFrame) {
                return;
            }

            clearTimeout(this.headerTimer);
            this.headerTimer = setTimeout(function(){
                this.$headerTool.hide();
            }.bind(this), 10);
        }.bind(this));

        var className = this.$className.substr(this.$className.lastIndexOf('.') + 1, this.$className.length);
        var param = common.Menu.getClassConfig(className);

        if (param && param.hasChild === false) {
            return;
        }

        this.$target.droppable({
            greedy: true,
            accept: ".xm-dragging",
//            hoverClass: "ui-state-active",
            tolerance: 'pointer',
            deactivate: function() {
                this.$direct.hide();
                this.$target.removeClass('ui-state-active');
            }.bind(this),
            over: function(event){
                event.stopPropagation();
                if(this.floatingLayer){
                    return;
                }

                this.$target.addClass('ui-state-active');

                if($('.xm-dragging').length > 0){
                    this.$direct.show();
                    if(this.dockContainer){
                        this.dockContainer.$direct.show();
                    }

                }else{
                    this.$direct.hide();
                    if(this.dockContainer){
                        this.dockContainer.$direct.hide();
                    }
                }
            }.bind(this),
            out: function(){
                this.$direct.hide();
                this.$target.removeClass('ui-state-active');

            }.bind(this),
            drop: function(event){
                event.stopPropagation();
                this.$target.removeClass('ui-state-active');

                if(this.floatingLayer){
                    return;
                }

                var $toElement = $('.xm-dragging');         // floating 되어 있는 layer
                var view = $toElement.data('xmView');
                var win = $toElement.data('window');
                var direct = event.target.classList[0];

                if(    direct == 'top'  || direct == 'bottom'
                    || direct == 'left' || direct == 'right' || direct == 'center'){

                    this.addDockForm(view, direct);
                    win.close();

                    if(this.dockContainer){
                        this.dockContainer.saveLayerPosition();
                    }
                }

                this.$direct.hide();
                if(this.dockContainer){
                    this.dockContainer.$direct.hide();
                }

                $toElement = null;
                view = null;
                win = null;
                direct = null;

            }.bind(this)
        });
    },

    /**
     * 부모 dockContainer 의 dockList에 있는 뷰만 도킹한다.
     *
     * @param view
     * @param direct
     * @param viewFlex
     * @param meFlex
     * @param dockContainer
     */
    addDockForm: function(view, direct, viewFlex, meFlex, dockContainer){

        var parent = this.up();
        var index = null;

        view.floatingLayer = false;
        view.dockContainer = dockContainer || this.dockContainer;
        view._isDragging = false;

        var dropActive = $('div.ui-state-active');
        if (dropActive.length > 0) {
            dropActive.removeClass('ui-state-active');
        }

        for (var ix = 0, ixLen = parent.items.items.length; ix < ixLen; ix++) {
            if (parent.items.items[ix].id == this.id) {
                index = ix;
                break;
            }
        }

        var splitter = null;

        switch (direct) {
            case 'top':
            case 'bottom':
                if (parent.$className == 'Exem.TabPanel') {
                    return;
                }

                var wrapper = Ext.create('Ext.container.Container',{
                    alias: 'widget.wrapper',
                    layout: 'vbox',
                    flex: this.flex,
                    width: '100%',
                    height: '100%',
                    type: 'dock'
                });

                splitter = {
                    xtype: 'splitter',
                    listeners: {
                        scope: dockContainer || this.dockContainer,
                        move : dockContainer || this.dockContainer.saveLayerPosition
                    }
                };

                view.flex = viewFlex || 1;
                view.width = '100%';
                view.height = '50%';

                this.flex = meFlex || 1;
                this.width = '100%';
                this.height = '50%';

                if(direct == 'top'){
                    wrapper.add([view, splitter, this]);
                }else{
                    wrapper.add([this, splitter, view]);
                }

                parent.insert(index, wrapper);
                break;

            case 'left':
            case 'right':
                if(parent.$className == 'Exem.TabPanel'){
                    return;
                }

                wrapper = Ext.create('Ext.container.Container',{
                    alias: 'widget.wrapper',
                    layout: 'hbox',
                    width: '100%',
                    height: '100%',
                    flex: this.flex,
                    type: 'dock'
                });

                splitter = {
                    xtype: 'splitter'
                };

                view.flex = viewFlex || 1;
                view.width = '50%';
                view.height = '100%';

                this.flex = meFlex || 1;
                this.width = '50%';
                this.height = '100%';

                if(direct == 'left'){
                    wrapper.add([view, splitter, this]);
                }else{
                    wrapper.add([this, splitter, view]);
                }

                parent.insert(index, wrapper);

                break;

            case 'center' :

                if(parent.$className == 'Exem.TabPanel'){
                    parent.add(view);

                    this.tabIndex = parent.items.length -1;
                    parent.setActiveTab(this.tabIndex);

                }else{
                    wrapper = Ext.create('Exem.TabPanel',{
                        width: '100%',
                        height: '100%',
                        flex: this.flex,
                        styleType: 1, // Tab Style Type
                        type: 'dock',
                        style : {
                            borderRadius: '6px'
                        },
                        listeners: {
                            tabchange: function (tabPanel, newCard, oldCard) {
                                if(oldCard){
                                    oldCard._isDragging = true;
                                }

                                newCard._isDragging = false;
                                if(newCard.frameRefresh){
                                    newCard.frameRefresh.call(newCard);
                                }

                                if(newCard.frameResize){
                                    newCard.frameResize();
                                }
                            }
                        }

                    });

                    if (view.backTotheTab && view.prevSiblingFlex != null && view.prevSiblingFlex == 0) {
                        wrapper.add(view, this);
                    } else {
                        wrapper.add(this, view);
                    }

                    parent.insert(index, wrapper);

                    wrapper.setActiveTab(view.backTotheTab == null ? 1 : view.prevSiblingFlex);

                    this.prevSiblingFlex = null;

                    this.tabIndex = 0;
                    wrapper =  null;
                }

                this.isTab = true;
                view.backTotheTab = null;
                view.$direct.addClass('xm-dock-tab');
                this.$direct.addClass('xm-dock-tab');
                break;

            default:
                break;
        }

        view.attachMoveDirection();

        if (this.dockContainer) {
            this.dockContainer.addDockList(view);
        }

        if (view.frameTitle) {
            view.frameTitle.show();
        }

        if (view.expendIcon) {
            view.expendIcon.show();
        }

        if (this.$headerTool != null) {
            this.$headerTool.hide();
        }

        parent  = null;
        dropActive = null;
        splitter = null;
    },

    /**
     *
     */
    createDockTool: function(){
        this.$headerTool = $('<div class="xm-header-dock"><div class="xm-dock-menu-tool icon"></div><div class="xm-dock icon"></div><div class="xm-close icon active"></div></div>').hover(function(){
            clearTimeout(this.headerTimer);
            this.headerTimer = null;
        }.bind(this), function(){
            clearTimeout(this.headerTimer);
            this.headerTimer = setTimeout(function(){
                this.$headerTool.hide();
            }.bind(this), 100);
        }.bind(this));

        this.$hiddenLayer = $('<div class="xm-dock-form-hidden-layer"></div>');

        // docking...
        this.$headerTool

            .find('.xm-dock').on('click', this.detachToWindow.bind(this))
            .siblings('.xm-close').on('click', function(e){
                e.stopPropagation();
                this.$headerTool.hide();
                this.detachToWindow(e, true);


            }.bind(this));

        if(this.showToolMenu){
            this.$headerTool.find('.xm-dock-menu-tool').on('click', this.toolMenuFn.bind(this)).css('display', 'block');
        }

        $(this.$target).append(this.$hiddenLayer);
        $('body').append(this.$headerTool);
    },

    returnPosition: function(){
        var win = this.up();
        var direct = null;

        this.attachMoveDirection();
        if(this.prevSiblingNode){
            /* 0 : left or top , 1: splitter, 2: right or bottom */
            switch(this.prevDirect){
                case 'hbox0': direct = 'left';
                    break;
                case 'hbox2': direct = 'right';
                    break;
                case 'vbox0': direct = 'top';
                    break;
                case 'vbox2': direct = 'bottom';
                    break;
                case 'center': direct = 'center';
                    break;
                default:
                    break;
            }
            if(this.prevSiblingNode == this.dockContainer.dockBackground){
                if(this.dockContainer){
                    this.dockContainer.addDockForm(this, direct, this.flex, this.prevSiblingFlex);
                }
            }else if(this.prevSiblingNode.alias == 'widget.wrapper'){
                if(this.prevSiblingNode.up().$className == 'Exem.DockContainer'){
                    if(this.dockContainer){
                        this.dockContainer.addDockForm(this, direct, this.flex, this.prevSiblingFlex);
                    }
                }else{
                    this.addDockForm.call(this.prevSiblingNode, this, direct, this.flex, this.prevSiblingFlex, this.dockContainer);
                }
            }else if(this.prevSiblingNode.$className == 'Exem.TabPanel' && direct == 'center'){
                // prevDirect 를 이전 탭 index 로 사용
                this.returnTabPosition(this.prevSiblingNode, this.prevSiblingFlex, this);
            }else{
                if(this.prevSiblingNode.addDockForm){
                    // prevSiblingFlex 이전 탭 index로 사용
                    this.prevSiblingNode.addDockForm(this, direct, this.flex, this.prevSiblingFlex);
                }else{
                    // 이전 옆의 노드가 탭일경우
                    this.addTabPosition(this.prevSiblingNode, direct, this.prevSiblingFlex, this.flex);
                }
            }
            win.close();
        }

        win = null;
    },

    /**
     *
     * @param view{object} tab 객체
     * @param direct
     * @param viewFlex
     * @param meFlex
     */
    addTabPosition: function(view, direct, viewFlex, meFlex){
        var parent = view.up();
        var index = null;

        this.floatingLayer = false;
        this._isDragging = false;

        var dropActive = $('div.ui-state-active');
        if(dropActive.length > 0){
            dropActive.removeClass('ui-state-active');
        }

        for(var ix = 0, ixLen = parent.items.items.length; ix < ixLen; ix++){
            if(parent.items.items[ix].id == view.id){
                index = ix;
                break;
            }
        }

        var splitter = null;

        switch(direct){
            case 'top':
            case 'bottom':
                var wrapper = Ext.create('Ext.container.Container',{
                    alias: 'widget.wrapper',
                    layout: 'vbox',
                    flex: this.flex,
                    width: '100%',
                    height: '100%',
                    type: 'dock'
                });

                splitter = {
                    xtype: 'splitter'
                };

                view.flex = viewFlex || 1;
                view.width = '100%';
                view.height = '50%';

                this.flex = meFlex || 1;
                this.width = '100%';
                this.height = '50%';

                if (direct === 'top') {
                    wrapper.add(this, splitter, view);
                } else {
                    wrapper.add(view, splitter, this);
                }

                parent.insert(index, wrapper);
                break;

            case 'left':
            case 'right':
                wrapper = Ext.create('Ext.container.Container',{
                    alias: 'widget.wrapper',
                    layout: 'hbox',
                    width: '100%',
                    height: '100%',
                    flex: this.flex,
                    type: 'dock'
                });

                splitter = {
                    xtype: 'splitter'
                };

                view.flex = viewFlex || 1;
                view.width = '50%';
                view.height = '100%';

                this.flex = meFlex || 1;
                this.width = '50%';
                this.height = '100%';

                if (direct === 'left') {
                    wrapper.add(this, splitter, view);
                } else {
                    wrapper.add(view, splitter, this);
                }

                parent.insert(index, wrapper);
                break;

            default:
                break;
        }

        this.attachMoveDirection();

        if(this.dockContainer){
            this.dockContainer.addDockList(view);
        }

        if(this.frameTitle){
            this.frameTitle.show();
        }

        if(this.expendIcon){
            this.expendIcon.show();
        }

        view = null;
        parent = null;
        dropActive = null;
        splitter = null;
    },

    returnTabPosition: function(tab, index, view){
        var win = this.up();

        this.attachMoveDirection();

        tab.insert(index, view);
        win.close();
        win = null;
        tab = null;
        view = null;
    },

    detachToWindow: function(e, isRemove){
        var parent = this.up();
        var parentFlex = parent.flex;
        var grandParent = parent.up();
        var index = null;
        var ix = null, ixLen = null, jx = null, jxLen = null;
        var item = null;

        var isFireEvent = (arguments != null && arguments[0].fireEvent != null);

        if (!window.isLockRTMFrame) {
            this.$headerTool.hide();
        }

        //if (isFireEvent === true && Comm.rtmShow !== true ||
        if (isFireEvent === true && Comm.RTComm.isRTMShow() !== true ||
            isFireEvent === true && this.prevSiblingNode && this.prevSiblingNode.isDestroyed === true ||
            isFireEvent === true && this.prevSiblingNode && this.prevSiblingNode.floatingLayer && this.floatingLayer)
        {
            arguments[0].fireEvent('maximize', arguments[0]);

        } else if(this.floatingLayer) {
            this.returnPosition();

        } else {
            if (this.dockContainer && ! isRemove) {
                if(this.frameTitle){
                    this.frameTitle.hide();
                }

                if(this.expendIcon){
                    this.expendIcon.hide();
                }
                this.floatingLayer = true;

                if(parent.alias == 'widget.basetabpnel'){

                    this.prevSiblingFlex = parent.items.indexMap[this.id];
                }

                this.dockContainer.detachToWindow(this);
                this.$direct.detach();
            }else if(isRemove){
                this.$direct.remove();
                this.destroy();
            }

            if (parent.alias == 'widget.wrapper') {
                var prevIndex = parent.items.indexMap[this.id];

                for(ix = 0, ixLen = parent.items.items.length; ix < ixLen; ix++){
                    item = parent.items.items[ix];

                    if(item.xtype == 'dockform' || item.xtype == 'container' || item.xtype == 'basetabpnel'){
                        this.prevSiblingFlex = item.flex;

                        item.width = '100%';
                        item.height = '100%';
                        item.flex = parentFlex;

                        for(jx = 0, jxLen = grandParent.items.items.length; jx < jxLen; jx++){
                            if(grandParent.items.items[jx].id == parent.id){
                                index = jx;
                                break;
                            }
                        }

                        // 150311 변경된 Frame 정보를 갱신(Insert, Remove) 하는데 비동기화 처리함.
                        setTimeout(function(index, item, parent, grandParent){
                            Ext.suspendLayouts();
                            grandParent.insert(index, item);
                            grandParent.remove(parent);
                            Ext.resumeLayouts(true);
                        }, 1, index, item, parent, grandParent);

                        this.prevSiblingNode = item;

                        this.prevDirect = parent.layout.id.split('-')[0] + prevIndex;

                        break;
                    }
                }
            } else if (parent.alias == 'widget.basetabpnel') {
                if(parent.items.length > 1){
                    this.prevSiblingNode = parent;
                }else{
                    for(ix = 0, ixLen = parent.items.items.length; ix < ixLen; ix++){
                        item = parent.items.items[ix];

                        for(jx = 0, jxLen = grandParent.items.items.length; jx < jxLen; jx++){
                            if(grandParent.items.items[jx].id == parent.id){
                                index = jx;
                                break;
                            }
                        }

                        item.width = '100%';
                        item.height = '100%';
                        item.flex = parentFlex;

                        // 150311 변경된 Frame 정보를 갱신(Insert, Remove) 하는데 비동기화 처리함.
                        setTimeout(function(index, item, parent, grandParent){
                            Ext.suspendLayouts();
                            grandParent.insert(index, item);
                            grandParent.remove(parent);
                            Ext.resumeLayouts(true);
                        }, 1, index, item, parent, grandParent);

                        item.$direct.removeClass('xm-dock-tab');
                    }
                    this.prevSiblingNode = item;
                }
                this.prevDirect = 'center';
                this.backTotheTab = true;
            }else{
                this.prevSiblingNode = parent;
            }
        }

        if(this.dockContainer){
            this.dockContainer.saveLayerPosition();
        }

        this.isTab = false;
        this.$direct.removeClass('xm-dock-tab');
        parent = null;
        grandParent = null;
        prevIndex = null;
    },

    dropFrameEvent: function(event){
        this.$target.removeClass('ui-state-active');

        if(this.floatingLayer){
            return;
        }

        var $toElement = $('.xm-dragging');         // floating 되어 있는 layer
        var view = $toElement.data('xmView');
        var win = $toElement.data('window');
        var direct = event.target.classList[0];

        if(    direct == 'top'  || direct == 'bottom'
            || direct == 'left' || direct == 'right' || direct == 'center'){

            // 150311 화면을 드래그해서 추가할때 비동기화 처리
            win.hide();
            setTimeout(function(win, view, direct) {
                this.addDockForm(view, direct);
                win.close();
            }.bind(this), 1, win, view, direct);

            if(this.dockContainer){
                this.dockContainer.saveLayerPosition();
            }
        }

        this.$direct.hide();
        if(this.dockContainer){
            this.dockContainer.$direct.hide();
        }

        $toElement = null;
        view = null;
        win = null;
        direct = null;
    },

    createMoveDirection: function(){
        var pOffSet = this.$target.offset();

        this.$direct = $(
            '<div class="xm-direct">'+
            '<div class="wrap">'+
            '<div class="xm-direct-background"></div>'+
            '<div class="top"><span class="top"></span></div>'+
            '<div class="xm-direct-center-wrap">'+
            '<div class="right"></div>'+
            '<div class="left"></div>'+
            '<div class="center"></div>'+
            '</div>'+
            '<div class="bottom"><span class="bottom"></span></div>'+
            '</div>'+
            '</div>'
        );

        this.attachMoveDirection();

        this.$direct.css({
            top: pOffSet.top + (this.$target.height() / 2) - (this.$direct.height() / 2),
            left: pOffSet.left  + (this.$target.width() / 2) - (this.$direct.width() / 2)
        });

        // ---------------------- top
        this.$direct.find('.top span').droppable({
            greedy: true,
            tolerance: "pointer",
            accept: ".xm-dragging",
            drop: this.dropFrameEvent.bind(this)
        }).hover(function(e){
            e.stopPropagation();
            e.target.style.backgroundPosition = '-322px -5px';

            this.$hiddenLayer.css({
                height: this.$target.height() / 2,
                width: '100%',
                top: '0px',
                left: '0px',
                right: '',
                bottom: ''
            }).show();

            $('.xm-dragging').data('direct', e.target.className);

            e = null;
        }.bind(this), function(e){
            e.stopPropagation();
            e.target.style.backgroundPosition = '-286px -5px';

            this.$hiddenLayer.hide();
            $('.xm-dragging').data('direct', '');
        }.bind(this));

        // ---------------------- bottom
        this.$direct.find('.bottom  span').droppable({
            greedy: true,
            tolerance: "pointer",
            accept: ".xm-dragging",
            drop: this.dropFrameEvent.bind(this)
        }).hover(function(e){
            e.stopPropagation();
            e.target.style.backgroundPosition = '-322px -41px';

            this.$hiddenLayer.css({
                height: this.$target.height() / 2,
                width: '100%',
                top: '',
                left: '0px',
                right: '',
                bottom: '0px'
            }).show();

            $('.xm-dragging').data('direct', e.target.className);

            e = null;
        }.bind(this), function(e){
            e.stopPropagation();
            e.target.style.backgroundPosition = '-286px -41px';

            this.$hiddenLayer.hide();
            $('.xm-dragging').data('direct', '');
        }.bind(this));
        // ---------------------- left
        this.$direct.find('.left').droppable({
            greedy: true,
            tolerance: "pointer",
            accept: ".xm-dragging",
            drop: this.dropFrameEvent.bind(this)
        }).hover(function(e){
            e.stopPropagation();
            e.target.style.backgroundPosition = '-322px -113px';

            this.$hiddenLayer.css({
                height: '100%',
                width: this.$target.width() / 2,
                top: '0px',
                left: '0px',
                right: '',
                bottom: ''
            }).show();
            $('.xm-dragging').data('direct', e.target.className);

            e = null;
        }.bind(this), function(e){
            e.stopPropagation();
            e.target.style.backgroundPosition = '-286px -113px';

            this.$hiddenLayer.hide();
            $('.xm-dragging').data('direct', '');
        }.bind(this));

        // ---------------------- right
        this.$direct.find('.right').droppable({
            greedy: true,
            tolerance: "pointer",
            accept: ".xm-dragging",
            drop: this.dropFrameEvent.bind(this)
        }).hover(function(e){
            e.stopPropagation();
            e.target.style.backgroundPosition = '-322px -149px';

            this.$hiddenLayer.css({
                height: '100%',
                width: this.$target.width() / 2,
                top: '0px',
                left: '',
                right: '0px',
                bottom: ''
            }).show();
            $('.xm-dragging').data('direct', e.target.className);

            e = null;
        }.bind(this), function(e){
            e.stopPropagation();
            e.target.style.backgroundPosition = '-286px -149px';

            this.$hiddenLayer.hide();
            $('.xm-dragging').data('direct', '');
        }.bind(this));
        // ---------------------- center
        this.$direct.find('.center').droppable({
            greedy: true,
            tolerance: "pointer",
            accept: ".xm-dragging",
            drop: this.dropFrameEvent.bind(this)
        }).hover(function(e){
            e.stopPropagation();
            e.target.style.backgroundPosition = '-322px -77px';

            this.$hiddenLayer.css({
                height: '100%',
                width: '100%',
                top: '0px',
                left: '',
                right: '0px',
                bottom: ''
            }).show();
            $('.xm-dragging').data('direct', e.target.className);

            e = null;
        }.bind(this), function(e){
            e.stopPropagation();
            e.target.style.backgroundPosition = '-286px -77px';

            this.$hiddenLayer.hide();
            $('.xm-dragging').data('direct', '');
        }.bind(this));

        pOffSet = null;
    },

    attachMoveDirection: function(){
        $('body').append(this.$direct);
    }
});