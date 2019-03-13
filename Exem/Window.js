Ext.define("Exem.Window", {
    extend: 'Ext.window.Window',
    alias: 'widget.basewindow',
    maximizable : true,
    border: false,
    constrain: true,
    constructor: function() {
        this.callParent(arguments);

        this.loadingMask = Ext.create('Exem.LoadingMask', {
            target: this
        });
    }
});




