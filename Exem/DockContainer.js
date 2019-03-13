Ext.define("Exem.DockContainer", {
    extend: 'Exem.Container',
    alias: 'widget.dockcontainer',
    layout: 'fit',
    height: '100%',
    width: '100%',

    _directSize: 34,
    className: null,                    // local storage 에 저장 될 클래스 이름
    saveIndex: 0,                       // local storage 에 저장된 여러가지 뷰 중 가져올 인덱스
    defalutLayer: null,                 // local storage 에 설정된 기본 레이어
    autoSave    : false,
    dockList: null,


    constructor: function() {
        this.callParent(arguments);

        this.dockBackground = Ext.create('Ext.container.Container', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            listeners: {
                scope: this,
                /**
                 * @note 프레임이 하나밖에 없는 상태에서 다른 프레임을 생성하여 드래그 할 경우 dockcontainer 의 drop event 가 없어지는 현상이 발생하여
                 * 다시 drop event 를 걸어준다.
                 */
                remove: function(me){
                    if(me.items.items.length == 0){
                        this.$target.droppable('destroy');
                        this.bindDropEvent();
                    }
                }
            }
        });

        this.expandView = Ext.create('Ext.container.Container', {
            layout: 'fit',
            hidden: true,
            style: {
                zIndex: 1000,
                background: '#fff'
            }
        });

        this.add(this.dockBackground, this.expandView);

        this.initEvent();
    },

    initEvent: function(){

        this.initProperty();

        this.addListener('resize', function(){
            if (! this.$target) {
                return;
            }

            this.$direct.filter('.top').css('left', (this.$target.width() / 2) - (this._directSize / 2 ));
            this.$direct.filter('.bottom').css('left', (this.$target.width() / 2) - (this._directSize / 2 ));
            this.$direct.filter('.left').css('top', (this.$target.height() / 2) - (this._directSize / 2 ));
            this.$direct.filter('.right').css('top', (this.$target.height() / 2) - (this._directSize / 2 ));
        });
    },

    initProperty: function(){
        this.dockList = [];
    },

    init: function(){
        this.$target = $(this.el.dom);

        this.createMoveDirection();
        this.createBackgroundLayer();
        this.setUpIView();

        this.dockEventBinding();

        this.initSaveLayerPosition();
    },

    bindDragEvent: function(win, view){
        var self = this;

        view.floatingLayer = true;

        $('#' + win.id).draggable({
            scroll: false,
            handle: '#' + win.header.id,
            create: function(e){
                e.stopPropagation();
                $(this).addClass('xm-floating-layer');
            },
            start: function(e) {
                e.stopPropagation();
                $(this).addClass('xm-dragging').data('xmView')._isDragging = true;
            },
            drag: function() {

            }.bind(this),
            stop: function(e) {
                e.stopPropagation();
                $(this).removeClass('xm-dragging').data('xmView')._isDragging = false;
                self.$direct.fadeOut('fast');
            }
        }).data('xmView', view).data('window', win);

        $('#' + win.items.items[0].id).css({
            left: 0,
            top: 0
        });

        win.header.el.on('dblclick', view.detachToWindow.bind(view, win));

        view = null;
        win = null;
    },

    bindDropEvent: function(){
        this.$target.droppable({
            accept: '.xm-dragging',
            tolerance: 'pointer',
            over: function(event){
                event.stopPropagation();
                var $dragEl = $('.xm-dragging');
                if($dragEl.length > 0){

                    this.$direct.show();
                }else{
                    this.$direct.hide();
                }

                $dragEl = null;
            }.bind(this),
            out: function(){
                this.$direct.hide();
            }.bind(this),
            drop: function(event){
                event.stopPropagation();
                this.$direct.hide();
            }.bind(this)
        });
    },

    dockEventBinding: function(){
        this.bindDropEvent();
    },

    addDockList: function(item){
        if(this.getDockList(item.id)){
            return;
        }

        this.dockList.push({
            cls : item.$className,
            id  : item.id,
            obj : item
        });


        item.dockContainer = this;

        item = null;
    },

    getDockList: function(id){
        var ix, ixLen;

        for(ix = 0, ixLen = this.dockList.length; ix < ixLen; ix++){
            if(this.dockList[ix] && this.dockList[ix].id == id){
                break;
            }
        }

        return this.dockList[ix];
    },

    removeDockList: function(item){
        var ix, ixLen;

        for(ix = 0, ixLen = this.dockList.length; ix < ixLen; ix++){
            if(this.dockList[ix] && this.dockList[ix].id == item.id){
                delete this.dockList[ix];
                this.dockList.splice(ix, 1);
                item = null;
                break;
            }
        }

        item = null;
    },

    /**
     * dockList에 있는 뷰만 도킹한다.
     *
     * @param view
     * @param direct
     * @param viewFlex
     * @param meFlex
     */
    addDockForm: function(view, direct, viewFlex, meFlex){
        var items = this.dockBackground.items.items;
        var wrapper = null;
        var splitter = null;

        view.floatingLayer = false;
        view.dockContainer = this;
        view._isDragging   = false;

        var $dropActive = $('div.ui-state-active');
        if ($dropActive.length > 0) {
            $dropActive.removeClass('ui-state-active');
        }

        view.attachMoveDirection(this);

        if (items.length == 0) {
            this.dockBackground.add(view);
        } else {
            splitter = {
                xtype: 'splitter'
            };

            switch (direct) {
                case 'top':
                case 'bottom':
                    wrapper = Ext.create('Ext.container.Container',{
                        alias: 'widget.wrapper',
                        layout: 'vbox',
                        width: '100%',
                        height: '100%',
                        flex: 1,
                        type: 'dock',
                        style: {
                            background: this.backgroundColor
                        }
                    });

                    view.flex = viewFlex || 1;
                    view.width = '100%';
                    if (!view.maxHeight) {
                        view.isSetMaxHeight = true;
                        view.maxHeight      = view.getHeight() || view.height;
                    }
                    view.height = '50%';

                    items[0].flex = meFlex || 1;
                    items[0].width = '100%';
                    items[0].height = '50%';

                    if (view.flex == 1 && items[0].flex == 1) {
                        var viewH = view.getHeight();
                        var itemH = items[0].getHeight();
                        if (viewH < itemH) {
                            items[0].flex = Math.floor(itemH/viewH);
                        } else {
                            view.flex = Math.floor(viewH/itemH);
                        }
                    }

                    if (direct === 'top') {
                        wrapper.add([view, splitter, items[0]]);
                    } else {
                        wrapper.add([items[0], splitter, view]);
                    }

                    this.dockBackground.add(wrapper);

                    if (view.isSetMaxHeight) {
                        view.maxHeight      = null;
                        view.isSetMaxHeight = undefined;
                    }

                    break;

                case 'left':
                case 'right':
                    wrapper = Ext.create('Ext.container.Container',{
                        alias: 'widget.wrapper',
                        layout: 'hbox',
                        width: '100%',
                        height: '100%',
                        flex: 1,
                        type: 'dock',
                        style: {
                            background: this.backgroundColor
                        }
                    });

                    view.flex = viewFlex || 1;
                    view.width = '50%';
                    view.height = '100%';

                    items[0].flex = meFlex || 1;
                    items[0].width = '50%';
                    items[0].height = '100%';

                    if (direct === 'left') {
                        wrapper.add([view, splitter, this.dockBackground.items.items[0]]);
                    } else {
                        wrapper.add([this.dockBackground.items.items[0], splitter, view]);
                    }

                    this.dockBackground.add(wrapper);
                    break;

                default:
                    break;
            }
        }

        if (view.frameTitle) {
            view.frameTitle.show();
        }

        if (view.expendIcon) {
            view.expendIcon.show();
        }

        this.addDockList(view);

        this.saveLayerPosition();

        viewFlex = null;
        meFlex   = null;
        direct = null;
        items  = null;
        view   = null;
        $dropActive = null;
        wrapper  = null;
        splitter = null;
    },

    createMoveDirection: function() {
        var width = 34;
        var height = 34;
        var left = (this.$target.width() / 2) - (width / 2);
        var top = (this.$target.height() / 2) - (height / 2);

        this.$direct = $(
            '<div class="top xm-root-direct"></div>'+
            '<div class="right xm-root-direct"></div>'+
            '<div class="left xm-root-direct"></div>'+
            '<div class="bottom xm-root-direct"></div>'
        );

        this.$direct.filter('.top').droppable({
            greedy: true,
            tolerance: "pointer",
            accept: ".xm-dragging",
            drop: function(event) {
                event.stopPropagation();
                var $toElement = $('.xm-dragging');         // floating 되어 있는 layer
                var view = $toElement.data('xmView');
                var win = $toElement.data('window');

                this.$direct.hide();
                $('.xm-direct').hide();
                this.$hiddenLayer.hide();

                try {
                    this.addDockForm(view, event.target.classList[0]);
                    win.close();
                } catch (e) {
                    console.error(this.$className, e.message);
                }


                setTimeout(function($toElement){
                    $toElement.draggable('destroy');
                    $toElement = null;
                }, 500, $toElement);

                view = null;
                win = null;

            }.bind(this)
        }).hover(function(e){
            e.stopPropagation();
            e.target.style.backgroundPosition = '-322px -5px';

            var height = this.dockBackground.items.items.length == 0 ? '100%' : this.$target.height() / 2;

            this.$hiddenLayer.css({
                height: height,
                width: '100%',
                top: '0px',
                left: '0px',
                right: '',
                bottom: ''
            }).show();

            $('.xm-dragging').data('direct', e.currentTarget.className);
        }.bind(this), function(e){
            e.stopPropagation();
            e.target.style.backgroundPosition = '-286px -5px';

            this.$hiddenLayer.hide();
            $('.xm-dragging').data('direct', '');
        }.bind(this)).css({
            left: left
        });


        this.$direct.filter('.bottom').droppable({
            greedy: true,
            tolerance: "pointer",
            accept: ".xm-dragging",
            drop: function(event) {
                event.stopPropagation();
                var $toElement = $('.xm-dragging');         // floating 되어 있는 layer
                var view = $toElement.data('xmView');
                var win = $toElement.data('window');

                this.$hiddenLayer.hide();
                this.$direct.hide();
                $('.xm-direct').hide();

                try {
                    this.addDockForm(view, event.target.classList[0]);
                    win.close();
                } catch (e) {
                    console.error(this.$className, e.message);
                }

                setTimeout(function($toElement){
                    $toElement.draggable('destroy');
                    $toElement = null;
                }, 500, $toElement);

                view = null;
                win = null;
            }.bind(this)
        }).hover(function(e){
            e.stopPropagation();
            e.target.style.backgroundPosition = '-322px -41px';

            var height = this.dockBackground.items.items.length == 0 ? '100%' : this.$target.height() / 2;

            this.$hiddenLayer.css({
                height: height,
                width: '100%',
                top: '',
                left: '0px',
                right: '',
                bottom: '0px'
            }).show();

            $('.xm-dragging').data('direct', e.currentTarget.className);
        }.bind(this), function(e){
            e.stopPropagation();
            e.target.style.backgroundPosition = '-286px -41px';

            this.$hiddenLayer.hide();
            $('.xm-dragging').data('direct', '');
        }.bind(this)).css({
            left: left
        });

        this.$direct.filter('.left').droppable({
            greedy: true,
            tolerance: "pointer",
            accept: ".xm-dragging",
            drop: function(event) {
                event.stopPropagation();
                var $toElement = $('.xm-dragging');         // floating 되어 있는 layer
                var view = $toElement.data('xmView');
                var win = $toElement.data('window');

                this.$hiddenLayer.hide();
                this.$direct.hide();
                $('.xm-direct').hide();

                try {
                    this.addDockForm(view, event.target.classList[0]);
                    win.close();
                } catch (e) {
                    console.error(this.$className, e.message);
                }
                setTimeout(function($toElement){
                    $toElement.draggable('destroy');
                    $toElement = null;
                }, 500, $toElement);

                view = null;
                win = null;
            }.bind(this)
        }).hover(function(e){
            e.stopPropagation();
            e.target.style.backgroundPosition = '-322px -113px';

            var width = this.dockBackground.items.items.length == 0 ? '100%' : this.$target.width() / 2;

            this.$hiddenLayer.css({
                height: '100%',
                width: width,
                top: '0px',
                left: '0px',
                right: '',
                bottom: ''
            }).show();
            $('.xm-dragging').data('direct', e.currentTarget.className);
        }.bind(this), function(e){
            e.stopPropagation();
            e.target.style.backgroundPosition = '-286px -113px';

            this.$hiddenLayer.hide();
            $('.xm-dragging').data('direct', '');
        }.bind(this)).css({
            top: top
        });

        this.$direct.filter('.right').droppable({
            greedy: true,
            tolerance: "pointer",
            accept: ".xm-dragging",
            drop: function(event) {
                event.stopPropagation();
                var $toElement = $('.xm-dragging');         // floating 되어 있는 layer
                var view = $toElement.data('xmView');
                var win = $toElement.data('window');

                this.$hiddenLayer.hide();
                this.$direct.hide();
                $('.xm-direct').hide();

                try {
                    this.addDockForm(view, event.target.classList[0]);
                    win.close();
                } catch (e) {
                    console.error(this.$className, e.message);
                }

                setTimeout(function($toElement){
                    $toElement.draggable('destroy');
                    $toElement = null;
                }, 500, $toElement);

                view = null;
                win = null;

            }.bind(this)
        }).hover(function(e){
            e.stopPropagation();
            e.target.style.backgroundPosition = '-322px -149px';

            var width = this.dockBackground.items.items.length == 0 ? '100%' : this.$target.width() / 2;

            this.$hiddenLayer.css({
                height: '100%',
                width: width,
                top: '0px',
                left: '',
                right: '0px',
                bottom: ''
            }).show();
            $('.xm-dragging').data('direct', e.currentTarget.className);

        }.bind(this), function(e){
            e.stopPropagation();
            e.target.style.backgroundPosition = '-286px -149px';

            this.$hiddenLayer.hide();
            $('.xm-dragging').data('direct', '');
        }.bind(this)).css({
            top: top
        });

        this.$target.append(this.$direct);
    },

    createBackgroundLayer: function() {
        this.$hiddenLayer = $('<div class="xm-dock-container-hidden-layer"></div>');
        this.$target.append(this.$hiddenLayer);
    },

    toggleExpand: function(view) {
        if (view.expendIcon) {
            view.expendIcon.hide();
        }

        var className = view.$className;
        className = className.substr(className.lastIndexOf('.') + 1, className.length);
        var param = common.Menu.getClassConfig(className);

        param.isWindow = true;
        param.config = {
            isDock   : true,
            isExpand : true,
            isTool   : true,
            dockContainer : {
                className: this.className,
                RACList: this.RACList,
                selectedSingleInstance: this.selectedSingleInstance
            },
            floatingLayer : true
        };

        var win = common.OpenView.open(className, param);
        win.addListener('destroy', function(){
            if (this.expendIcon) {
                this.expendIcon.show();
            }

        }, view);

        if (win && win.expendIcon) {
            win.expendIcon.hide();
            win.expendIcon = null;
        }

        win   = null;
        view  = null;
        param = null;
        className = null;
    },

    showExpandView: function(view){
        view.isExpand = true;
        var viewParent = view.up();

        var width = view.el.dom.style.width;
        var height = view.el.dom.style.height;
        var top = view.el.dom.style.top;
        var left = view.el.dom.style.left;

        this.beforeExpandViewInfo = {
            view : view,
            viewParent : viewParent,
            viewBeforeIndex : viewParent.items.indexMap[view.id],
            width : width,
            height: height,
            top : top,
            left : left
        };

        var offSet = view.getPosition();
        var el;

        this.expandView.show();

        this.expandView.el.dom.style.position = 'absolute';
        this.expandView.el.dom.style.width = width;
        this.expandView.el.dom.style.height = height;
        this.expandView.el.dom.style.top = offSet[1] + 'px';
        this.expandView.el.dom.style.left = offSet[1] + 'px';
        this.expandView.el.dom.style.opacity = 0;

        if(view.expendIcon){

            el = view.expendIcon.el.dom.getElementsByClassName('trend-chart-icon')[0];
            el.style.width = '21px';
            el.style.height = '21px';
            el.style.backgroundPosition = '-5px -138px';
            el.className = 'trend-chart-icon-expand';
        }

        this.expandView.animate({
            duration: 500,
            to: {
                width: this.getWidth(),
                height: this.getHeight(),
                top : 0,
                left: 0,
                opacity: 1
            },
            listeners: {
                afteranimate: function(){
                    this.expandView.add(this.beforeExpandViewInfo.view);
                    this.beforeExpandViewInfo.view.el.dom.style.top = '0px';
                    this.beforeExpandViewInfo.view.el.dom.style.left = '0px';
                }.bind(this)
            }
        });

        view = null;
    },

    hideExpandView: function(){
        this.beforeExpandViewInfo.viewParent.insert(this.beforeExpandViewInfo.viewBeforeIndex, this.beforeExpandViewInfo.view);

        this.expandView.animate({
            duration: 500,
            to: {
                width: this.beforeExpandViewInfo.width,
                height: this.beforeExpandViewInfo.height,
                top : this.beforeExpandViewInfo.top,
                left: this.beforeExpandViewInfo.left,
                opacity: 0
            },
            listeners: {
                afteranimate: function(){

                    this.beforeExpandViewInfo.view.isExpand = false;
                    this.expandView.hide();
                    this.beforeExpandViewInfo = null;
                }.bind(this)
            }
        });
    },

    detachToWindow: function(obj){
        var className = obj.$className.substring(obj.$className.lastIndexOf('.')+1);
        var classInfo = common.Menu.getClassConfig(className) || {};

        var windowMargin = 26;
        var windowTitleMargin = 30;

        var win = Ext.create('Exem.XMWindow', {
            layout      : 'fit',
            title       : classInfo.title || obj.title,
            width       : classInfo.width + windowMargin|| 600,
            height      : classInfo.height + windowMargin || 500,
            minWidth    : classInfo.minWidth + windowMargin || 150,
            minHeight   : classInfo.minHeight + windowMargin + windowTitleMargin || 150,
            items       : obj,
            draggable   : false,
            constrain   : true,
            floating    : {shadow: false},
            //toggleMaximize: function(){},
            cls         : 'xm-dock-window-base'
        }).show();

        this.bindDragEvent(win, obj);
        obj.show();

        this.saveLayerPosition();

        /**
         * @note 프레임이 하나밖에 없는 상태에서 다른 프레임을 생성하여 드래그 할 경우 dockcontainer 의 drop event 가 없어지는 현상이 발생하여
         * 다시 drop event 를 걸어준다.
         */
//        if(this.dockBackground.items.items.length == 0){
//            this.$target.droppable('destroy');
//            this.bindDropEvent();
//        }

        classInfo = null;
        win = null;
        obj = null;
    },

    setUpDashboard: function(type) {

        this.viewList = Comm.RTComm.getDockLayer(type);

        if (this.viewList) {
            if (!Ext.isObject(this.viewList) && !Ext.isArray(this.viewList)) {
                this.viewList = JSON.parse(this.viewList) || [];
            }
        } else {
            this.viewList = JSON.parse(this.defaultDockLayer) || [];
        }

        this.suspendEvents();

        this.createNode(this.viewList, this.dockBackground);

        this.resumeEvents();
    },

    setUpIView: function() {
        this.saveIndex = Comm.web_env_info['xm-dock-save-' + this.className] || 0;
        this.viewList = Comm.web_env_info['xm-dock-position-' + this.className + '-' + this.saveIndex];

        if (this.viewList) {
            if (!Ext.isObject(this.viewList) && !Ext.isArray(this.viewList)) {
                this.viewList = JSON.parse(this.viewList) || [];
            }
        } else {
            this.viewList = JSON.parse(this.defaultDockLayer) || [];
        }

        try{
            this.suspendEvents();
            this.createNode(this.viewList, this.dockBackground);
            this.resumeEvents();
        }catch(exception){
            this.loadingMask.hide();

            var errorMsg  = "Error Message: " + exception.message + '<br>';
            errorMsg += "Error Code: "    + exception.number & 0xFFFF + '<br>';
            errorMsg += "Error Name: "    + exception.name;

            common.Util.showMessage(common.Util.TR('Error'), errorMsg, Ext.Msg.OK, Ext.MessageBox.ERROR);
        }
    },

    createNode: function(items, parent){



        if(! items){
            return;
        }

        var item = null;
        var flex = null;
        var viewInfo = null;
        var className = null;
        var minHeight = null;
        var minWidth = null;

        for(var ix = 0, ixLen = items.length; ix < ixLen; ix++){

            flex = items[ix].flex;
            if(items[ix].cls == 'Ext.container.Container'){
                item = Ext.create(items[ix].cls, {
                    alias: 'widget.wrapper',
                    layout: items[ix].layout,
                    width: '100%',
                    height: '100%',
                    flex: flex,
                    type: 'dock',
                    style: {
                        background: this.backgroundColor
                    }
                });

                if(parent.$className == 'Ext.container.Container'){
                    if(parent.items.items.length == 1){
                        parent.add([{
                            xtype: 'splitter',
                            style:{
                                background : this.backgroundColor
                            }}, item]);
                    }else{
                        parent.add(item);
                    }
                }else if(parent.$className == 'Exem.TabPanel'){
                    parent.add(item);

                    item.isTab = true;
                    item.$direct.addClass('xm-dock-tab');
                }else{
                    parent.add(item);
                }

            }else if(items[ix].cls == 'Exem.TabPanel'){
                item = Ext.create(items[ix].cls,{
                    width: '100%',
                    height: '100%',
                    styleType: 1, // Tab Style Type
                    flex: flex,
                    type : 'dock',
                    style: {
                        background: this.backgroundColor,
                        borderRadius: '6px'
                    },
                    autoRender: true,
                    listeners: {
                        tabchange: function(tabPanel, newCard, oldCard){
                            if(oldCard){
                                oldCard._isDragging = true;
                            }

                            newCard._isDragging = false;
                            if(newCard.frameRefresh){
                                newCard.frameRefresh.call(newCard);
                            }

                            tabPanel = null;
                            newCard = null;
                            oldCard = null;
                        }
                    }
                });

                if(parent.$className == 'Ext.container.Container'){
                    if(parent.items.items.length == 1){
                        parent.add([{
                            xtype: 'splitter',
                            style:{
                                background : this.backgroundColor
                            }}, item]);
                    }else{
                        parent.add(item);
                    }
                }else if(parent.$className == 'Exem.TabPanel'){
                    parent.add(item);

                    item.isTab = true;
                    item.$direct.addClass('xm-dock-tab');

                }else{
                    parent.add(item);
                }
            }else{
                className = items[ix].cls;
                viewInfo = common.Menu.getClassConfig(className.substring(className.lastIndexOf('.')+1));

                if(viewInfo){
                    minHeight = viewInfo.minHeight;
                    minWidth = viewInfo.minWidth;
                }

                item = Ext.create(items[ix].cls,{
                    dockContainer: this,
                    $parentDirect: this.$direct,
                    flex: items[ix].flex,
                    minHeight: minHeight,
                    minWidth: minWidth,
                    componentId: items[ix].componentId
                });

                if(parent.$className == 'Ext.container.Container'){
                    if(parent.items.items.length == 1){
                        parent.add([{
                            xtype: 'splitter',
                            style:{
                                background : this.backgroundColor
                            }}, item]);
                    }else{
                        parent.add(item);
                    }
                }else if(parent.$className == 'Exem.TabPanel'){
                    parent.add(item);

                    parent.suspendEvents();
                    parent.setActiveTab(parent.items.length -1);
                    parent.resumeEvents();
                }else{
                    parent.add(item);
                }

                if(items[ix].frameOption && item.setFrameOption){
                    item.setFrameOption(items[ix].frameOption);
                }
                item.init();
                item.attachMoveDirection();
                item.dockContainer = this;

                if(parent.$className == 'Exem.TabPanel'){
                    item.isTab = true;
                    item.$direct.addClass('xm-dock-tab');
                }

                this.addDockList(item);

            }

            this.createNode(items[ix].items, item);
        }

        if(parent.$className == 'Exem.TabPanel'){
            parent.setActiveTab(0);
        }

        viewInfo = null;
        className = null;
        minHeight = null;
        minWidth = null;
        items = null;
        item = null;
    },


    checkChildTest: function(item, step) {
        if (!step) {
            step = '';
        }
        console.debug(step, item.$className, '[',item.minHeight, item.getHeight(), ']');

        if (item.items.length > 0) {
            for (var ix = 0; ix < item.items.items.length; ix++) {

                console.debug(step, item.layout.vertical);

                if (item.items.items[ix].$className == 'Ext.resizer.Splitter') {
                    continue;
                } else if (item.items.items[ix].$className == 'Ext.container.Container') {
                    var callParm = 0;
                    this.checkChildTest(item.items.items[ix], step+'----', callParm);

                } else {
                    callParm = item.items.items[ix].minHeight;
                    console.debug('%c'+step+' '+item.items.items[ix].$className+' ['+item.items.items[ix].minHeight+', '+item.items.items[ix].getHeight()+']', 'color: darkred;');
                }
            }
        } else {
            console.debug('# 1', item.$className);
        }

    },

    saveLayerPosition: function(save, index){
        index = (index == null)? this.saveIndex : index;

        if(typeof(save) === 'boolean'){
            if(this.autoSave === false && save === false){
                return;
            }
        }else{
            if(this.autoSave === false){
                return;
            }
        }

        this.viewList.length = 0;

        this.saveNode(this.dockBackground.items.items, this.viewList);

        this.setSaveIndex(index);

        var saveData = JSON.stringify(this.viewList);
        saveData = Comm.RTComm.changeTempComponentId(saveData);
        common.WebEnv.Save('xm-dock-position-' + this.className + '-' + index, saveData);
        saveData = null;
    },

    initSaveLayerPosition: function(){

        this.viewList.length = 0;

        this.saveNode(this.dockBackground.items.items, this.viewList);

        if (!Comm.web_env_info['xm-dock-position-' + this.className + '-' + this.saveIndex]) {
            this.setSaveIndex(this.saveIndex);

            var saveData = JSON.stringify(this.viewList);
            saveData = Comm.RTComm.changeTempComponentId(saveData);
            common.WebEnv.Save('xm-dock-position-' + this.className + '-' + this.saveIndex, saveData);
            saveData = null;
        }

    },

    saveNode: function(items, parent){
        var obj = null;
        var item = null;
        var flex = null;
        var layout = null;
        var type = null;

        if(! items){
            return;
        }

        for(var ix = 0, ixLen = items.length; ix < ixLen; ix++){
            item = items[ix];

            if(item.type != 'dock'){
                continue;
            }
            type = item.up().layout.id.split('-')[0];
            layout = item.layout.id.split('-')[0];

            switch(type){
                case 'card':
                case 'hbox':
                    flex = +item.el.dom.style.width.replace('px', '') || $('#' + item.id).width();
                    break;

                case 'vbox':
                    flex = +item.el.dom.style.height.replace('px', '') || $('#' + item.id).height();
                    break;

                default:
                    flex = 1;
                    break;
            }

            obj = {
                cls: item.$className,
                layout: layout,
                flex: flex || item.flex || 1,
                items: [],
                frameOption : item.getFrameOption ? item.getFrameOption() : null
            };

            if (item.componentId) {
                obj.componentId = item.componentId;
            }

            parent.push(obj);

            this.saveNode(item.items.items, obj.items);
        }

        items = null;
        item = null;
        obj = null;
    },

    /**
     * 현재 뷰 구성을 저장한다.
     * index 가 없을경우는 현재 인덱스에 있는 구성을 다시 저장한다.
     * @param index
     */
    setSaveIndex: function(index){
        if(index != null){
            this.saveIndex = index;
        }

        common.WebEnv.Save('xm-dock-save-' + this.className, this.saveIndex);
    },

    /**
     * 저장되어 있는 뷰 구성 정보를 가져온다.
     * @param index
     * @returns array
     */
    getSaveLayer: function(index){
        return Comm.web_env_info['xm-dock-position-' + this.className + '-' + index];
    },

    /**
     * 전환되기 이전의 뷰를 저장하고 해당 인덱스의 뷰를 가져와 다시 그린다.
     * @param index
     */
    reloadLayer: function(index){
        if(index == null /*|| index == this.saveIndex*/){
            return;
        }

        try{
            this.loadingMask.show();
            this.dockList.length = 0;

            this.saveLayerPosition();

            this.setSaveIndex(index);

            this.dockBackground.removeAll();
            this.setUpIView();
        }catch(exception){
            var errorMsg  = "Error Message: " + this.$className + + '_' + exception.message + '<br>';
            errorMsg += "Error Code: "    + exception.number & 0xFFFF + '<br>';
            errorMsg += "Error Name: "    + exception.name;

            common.Util.showMessage(common.Util.TR('ERROR'), errorMsg, Ext.Msg.OK, Ext.MessageBox.ERROR, function(){});
        }finally{
            this.loadingMask.hide();
        }
    },

    loadDashboardLayer: function(type){
        if (Ext.isEmpty(type)) {
            return;
        }

        try {
            this.dockList.length = 0;

            this.dockBackground.removeAll();

            this.setUpDashboard(type);

        } catch(exception) {
            var errorMsg  = "Error Message: " + this.$className + + '_' + exception.message + '<br>';
            errorMsg += "Error Code: "    + exception.number & 0xFFFF + '<br>';
            errorMsg += "Error Name: "    + exception.name;

            common.Util.showMessage(common.Util.TR('ERROR'), errorMsg, Ext.Msg.OK, Ext.MessageBox.ERROR, function(){});
        }
    }
});