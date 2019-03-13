Ext.define("Exem.TabPanel", {
    extend: 'Ext.tab.Panel',
    alias: 'widget.basetabpnel',
    border: false,
    deferredRender: false,
    hideMode: 'offsets',
    baseTab: false,
    plain: true,
    cls: 'exem-tabpanel',
    styleType: 0,               // 0 : 오른쪽 마진 영역이 없는 스타일 ( PA ), 1 : 오늘쪽 마진 영역이 있는 스타일 ( RTM )

    constructor: function() {
        this.callParent(arguments);
        this.loadingMask = Ext.create('Exem.LoadingMask', {
            target: this
        });

        this.getTabBar().layout.overflowHandler.scrollIncrement = 100;

        if (this.styleType == 1) {
            this.addListener('render', function(){
                this.tabMarginArea = Ext.create('Ext.container.Container', {
                    cls : 'exem-tabpanel-margin',
                    style: {
                        width: '2000px',
                        height: this.headerHeight,
                        zIndex: 3,
                        'margin-left': '5px',
                        background: '#fff',
                        'border-top-left-radius': '10px'
                    }
                });
                this.getTabBar().add(this.tabMarginArea);
            });
        }
    },

    setDeferredActiveTab: function(idx) {
        var me = this;

        setTimeout(function() {
            me.setActiveTab(idx);
        }, 1);
    }

});
