Ext.define('Exem.Container', {
    extend: 'Ext.container.Container',
    layout: 'fit',
    height: '100%',
    width: '100%',
    border: false,

    constructor: function() {
        this.callParent(arguments);

        this.loadingMask = Ext.create('Exem.LoadingMask', {
            target: this
        });
    }
});
