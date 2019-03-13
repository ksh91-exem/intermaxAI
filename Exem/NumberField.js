Ext.define("Exem.NumberField", {
    extend: 'Ext.form.field.Number',
    alias: 'widget.xmnumber',
    labelAlign: 'right',
    labelSeparator: '',

    defaultEmptyText   :  '0',
    emptyText :  '',

    minValue: 0,
    enforceMaxLength: true,
    defaultValue: '',

    isOnlyNumber: true,

    constructor: function() {
        this.callParent(arguments);

        this.emptyText = this.defaultEmptyText;

        // 수정 2014/08/27   JH
        this.addListener('focus', function(){
            this.emptyText = [''];
            this.applyEmptyText();
        });

        this.addListener('blur', function(){
            var value = this.getValue();
            if(value > this.maxValue){
                this.setValue(this.maxValue);
            } else if (value < this.minValue || !value){
                this.setValue(this.minValue);
            }
        });

        if(this.isOnlyNumber){
            this.addListener('keydown', function(numField, e){
                if ((e.keyCode == 108) || (e.keyCode == 105) || (e.keyCode == 109) || (e.keyCode == 110) || (e.keyCode == 106) ||
                    (e.keyCode == 189) || (e.keyCode == 188) || (e.keyCode == 186) || (e.keyCode == 68) || (e.keyCode == 228) ||
                    (e.keyCode == 229)){
                    e.stopEvent();
                }
            });
        }
    }

});
