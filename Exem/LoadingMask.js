Ext.define('Exem.LoadingMask', {
    target     : undefined,
    type       : undefined, // large-whirlpool / small-barloading / small-circleloading
    isShown    : false,
    backgroundMask: undefined,
    loadingBox : undefined,
    msgCt      : undefined,

    constructor: function(config) {
        for (var i in config) {
            this[i] = config[i];
        }
        if (!this.target) {
            console.warn('[Exem.LoadingMask] - target is undefined');
        } else {
            this.target.isLoading = false;
        }

        this.show     = this.showIE;
        this.hide     = this.hideIE;
    },

    show: function() {
        if (!this.isShown) {
            var html='',
                zIndex = {},
                targetEl = this.target.getEl();

            if (typeof targetEl === 'undefined')
                return;

            if (Ext.getClassName(this.target).substring(0,5) === 'view') {
                if (!this.type) {
                    this.type = 'large-whirlpool';
                }
                zIndex = {mask: 20020, logo: 20030};
            } else {
                if (!this.type) {
                    this.type = 'small-circleloading';
                }
                zIndex = {mask: 20000, logo: 20010};
            }

            this.backgroundMask = Ext.core.DomHelper.insertFirst(targetEl,
            {class:'loading-background-mask', style:'z-index:'+zIndex.mask}, true);
            this.backgroundMask.setVisibilityMode(2);

            this.loadingBox = Ext.core.DomHelper.insertFirst(targetEl,
                {class:this.type, style:'z-index:'+zIndex.logo}, true);
            this.loadingBoxEl = document.getElementById(this.loadingBox.id);

            var loadingText = common.Util.TR('Loading...');

            switch (this.type) {
                case 'large-whirlpool':
                    html += '<div class="large-whirlpool whirlpool-outer-circle"></div>' +
                            '<div class="large-whirlpool whirlpool-inner-circle"></div>' +
                            '<div class="large-whirlpool whirlpool-small-circle"></div>' +
                            '<div class="large-whirlpool whirlpool-text">' + loadingText + '</div>';
                    break;

                case 'small-barloading':
                    html += '<div class="barloading barloading_outer"></div>' +
                            '<div class="barloading barloading_inner"></div>' +
                            '<div class="barloading barloading_center"></div>' +
                            '<div class="barloading barloading_inner"></div>' +
                            '<div class="barloading barloading_outer"></div>';
                    break;

                case 'small-circleloading':
                    html += '<div class="circleloading circleloading_outer"></div>' +
                            '<div class="circleloading circleloading_inner"></div>';
                    break;

                default: break;
            }
            this.msgCt = Ext.core.DomHelper.append(this.loadingBox, html, true);
            this.loadingBox.setVisibilityMode(2);
        }

        var top = this.target.getHeight() / 2,
            left = this.target.getWidth() / 2;

        switch (this.type) {
            case 'large-whirlpool':
                left = left-125;
                break;
            case 'small-barloading':
                left = left-45;
                break;
            case 'small-circleloading':
                top = top-25;
                left = left-25;
                break;
            default:
                break;
        }
        this.loadingBoxEl.style.top = top+'px';
        this.loadingBoxEl.style.left = left+'px';

        this.loadingBox.show();
        this.backgroundMask.show();
        this.target.isLoading = true;
        this.isShown = true;
    },

    hide: function() {
        if (this.isShown) {
            this.target.isLoading = false;
            this.loadingBox.hide();
            this.backgroundMask.hide();
        }
    },

    showIE: function(isRTM, isColor, isBackground) {
        if (!this.isShown || isRTM) {
            var color = '';
            if (isRTM || isColor) {
                color = ($('body').hasClass('mx-theme-gray') || ($('body').hasClass('mx-theme-black')))? '#ccc' : '#000';
            }
            var opts = {
                lines     : 13,   // The number of lines to draw
                length    : (isRTM || this.type === 'large-whirlpool') ?  20 : 8,  // The length of each line
                width     : (isRTM || this.type === 'large-whirlpool') ?  10 : 6,  // The line thickness
                radius    : (isRTM || this.type === 'large-whirlpool') ?  30 : 19, // The radius of the inner circle
                corners   : 1,     // Corner roundness (0..1)
                rotate    : 18,    // The rotation offset
                direction : 1,     // 1: clockwise, -1: counterclockwise
                color     : color, //(isRTM && ($("body").hasClass('mx-theme-black') || $("body").hasClass('mx-theme-gray'))) ? '#ccc' : '#000', // #rgb or #rrggbb or array of colors
                speed     : 1.5,   // Rounds per second
                trail     : 36,    // Afterglow percentage
                shadow    : true,  // Whether to render a shadow
                hwaccel   : true,  // Whether to use hardware acceleration
                className : 'ie-spinner', // The CSS class to assign to the spinner
                zIndex    : 20010,   // The z-index (defaults to 2000000000)
                top       : '50%',   // Top position relative to parent
                left      : '50%'    // Left position relative to parent
            };
            this.targetEl = document.getElementById(this.target.id);
            this.ieSpinner = new Spinner(opts).spin(this.targetEl);
        }

        this.ieSpinner.spin(this.targetEl);
        this.target.isLoading = true;
        this.isShown = true;

        if (isBackground) {
            this.showBackground(isBackground);
        }
    },

    hideIE: function() {
        if (this.isShown) {
            this.target.isLoading = false;
            this.ieSpinner.stop();

            this.showBackground(false);
        }
    },

    showMask: function() {
        this.showIE(null, null, true);
    },

    showBackground: function(isView) {
        if (this.backgroundMask == null) {
            this.configBackgroundMask();
        }

        if (this.backgroundMask != null) {

            var mainTabBar = Ext.getCmp('mainTab').getTabBar();

            // Check component and function
            if (mainTabBar.items.items[this.activeTabIndex].setClosable) {
                this.backgroundMask.hide();
                return false;
            }

            if (isView === true) {
                if (this.activeTabIndex > 0 && mainTabBar.items.items[this.activeTabIndex].setClosable) {
                    mainTabBar.items.items[this.activeTabIndex].setClosable(false);
                }
                this.backgroundMask.show();
            } else {
                if (this.activeTabIndex > 0 && mainTabBar.items.items[this.activeTabIndex].setClosable) {
                    mainTabBar.items.items[this.activeTabIndex].setClosable(true);
                }
                this.backgroundMask.hide();
            }
        }
    },

    configBackgroundMask: function() {
        var targetEl   = null;
        var activeTab  = null;

        this.activeTabIndex = null;

        var mainTab = Ext.getCmp('mainTab');
        if (mainTab != null) {
            activeTab = mainTab.getActiveTab();
        }

        if (activeTab != null) {
            this.activeTabIndex = mainTab.items.findIndex('id', mainTab.getActiveTab().id);
        }

        if (this.activeTabIndex != null && mainTab.items.length > this.activeTabIndex) {
            targetEl = mainTab.items.items[this.activeTabIndex].el.dom;
        }

        if (targetEl != null) {
            this.backgroundMask = Ext.core.DomHelper.insertFirst(targetEl, {
                style: {
                    'display'   : 'none',
                    'position'  : 'absolute',
                    'width'     : '100%',
                    'height'    : '100%',
                    'overflow'  : 'hidden',
                    'right'     : '0px',
                    'bottom'    : '0px',
                    'text-align': 'center',
                    'background-color': 'rgba(0, 0, 0, 0.1)',
                    'z-index'   : '9999'
                }
            }, true);

            this.backgroundMask.setVisibilityMode(2);
        }

        targetEl = null;
        mainTab  = null;
    }

});
