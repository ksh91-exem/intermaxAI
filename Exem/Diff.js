Ext.define("Exem.Diff", {
    extend : 'Ext.container.Container',
    flex : 1,
    mode: 'text/x-java',
    hilight: true,
    lineNumbers: true,
    height: '100%',
    layout: 'fit',
    readOnly: false,
    diff: null,

    constructor : function(config) {
        this.superclass.constructor.call(this, config);
    },

    _createDiffLayer: function() {

        this.diff = CodeMirror.MergeView(document.getElementById(this.id),{
            highlightDifferences: this.hilight,
            mode: this.mode,
            lineNumbers: this.lineNumbers,
            readOnly: this.readOnly,
            orig: '',
            value: '',
            height: '100%'
        });
    },

    rightSetValue: function(text) {
        if (this.diff) {
            this.diff.left.orig.setValue(text);
        }
    },

    leftSetValue: function(text){
        if(this.diff){
            this.diff.edit.setValue(text);
        }
    },

    rightGetValue: function(){
        if (this.diff) {
            this.diff.edit.getValue();
        }
    },

    leftGetValue: function(){
        if (this.diff) {
            this.diff.left.orig.getValue();
        }
    },

    listeners: {
        afterRender : function() {
            this._createDiffLayer();
        }
    }

});
