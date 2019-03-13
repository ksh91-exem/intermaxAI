Ext.define("Exem.Panel", {
    extend: 'Ext.panel.Panel',
    alias: 'widget.basepanel',
    border: false,
    cls: 'Exem-Panel',


    constructor: function() {
        this.callParent(arguments);

        this.loadingMask = Ext.create('Exem.LoadingMask', {
            target: this
        });
    }
});
