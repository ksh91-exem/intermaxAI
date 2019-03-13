Ext.define("Exem.XMWindow", {
    extend: 'Ext.window.Window',
    alias: 'widget.xmbasewindow',
    layout: 'fit',
    constrain: true,
    title : null,
    maximizable : true,
    shadow: false,
    focusOnToFront: false,
    overflowX : 'hidden',
    overflowY : 'hidden',
    style : {
        'border': '5px solid #424242',
        'border-radius': '6px',
        'background': '#424242'
    },
    border: 9,
    baseCls: 'xm-window-base',
    bodyCls: 'xm-window-body',
    header : {
        height: 40
    },
    ghost: false,
    draggable : false,
    maximize  : function() {
        this.getTheme();
        this.callParent(arguments);
        this.resetTheme();
    },
    restore: function() {
        this.getTheme();
        this.callParent(arguments);
        this.resetTheme();
    },
    getTheme: function() {
        this.theme = null;
        this.lang = null;

        if ($('body').hasClass('mx-theme-black')) {
            this.theme = 'black';
        } else if ($('body').hasClass('mx-theme-gray')) {
            this.theme = 'gray';
        } else {
            this.theme = 'white';
        }

        if ($('body').hasClass('ja')) {
            this.lang = 'ja';
        } else {
            this.lang = '';
        }
    },
    resetTheme: function() {
        $('body').removeClass('mx-theme-black');
        $('body').removeClass('mx-theme-gray');

        if (this.theme === 'black') {
            $('body').addClass('mx-theme-black');
        } else if (this.theme === 'gray') {
            $('body').addClass('mx-theme-gray');
        } else {
            $('body').removeClass('mx-theme-black');
            $('body').removeClass('mx-theme-gray');
        }

        $('.xm-window-base').removeClass('xm-treewindow-mode-rtm');
        if(this.isRTM) {
            $('.xm-window-base').addClass('xm-treewindow-mode-rtm');
        }

        $('body').removeClass('ja');
        if (this.lang === 'ja') {
            $('body').addClass('ja');
        }
    },
    constructor: function() {
        this.callParent(arguments);

        if (this.title != null) {
            this.setTitle(this.title);
        }

        this.loadingMask = Ext.create('Exem.LoadingMask', {
            target: this
        });

        this.addListener('render', function(){
            if(! this.isDock){
                $('#' + this.id).draggable({
                    handle: '#' + this.header.id
                });
            }
        }, this);

    }

});


