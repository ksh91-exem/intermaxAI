Ext.define("Exem.TextField", {
    extend: 'Ext.form.field.Text',
    alias: 'widget.xmtextfield',
    labelAlign: 'right',
    labelSeparator: '',
    enforceMaxLength: true,
    defaultEmptyText   :  '',
    emptyText :  '',
    constructor: function() {
        this.callParent(arguments);

        // 수정 2014/08/27   JH
        this.emptyText = this.defaultEmptyText;

        this.addListener('focus', function(){
            this.emptyText = [''];
            this.applyEmptyText();
        });

        this.addListener('blur', function(){
            this.emptyText = this.defaultEmptyText;
            this.applyEmptyText();
        });
    }
});

