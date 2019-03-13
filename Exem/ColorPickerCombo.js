Ext.define('Exem.ColorPickerCombo', {
    extend: 'Ext.form.field.Trigger',
    alias: 'widget.colorcbo',
    triggerTip: 'Please select a color.',
    target: null,
    onTriggerClick: function() {
        var me = this;
        var picker = Ext.create('Ext.picker.Color', {
            pickerField: this,
            ownerCt: this,
            renderTo: this.target.id, // document.body,
            floating: true,
            hidden: true,
            focusOnShow: true,
            style: {
                backgroundColor: "#fff"
            } ,
            listeners: {
                scope:this,
                select: function(field, value){
                    me.setValue('#' + value);
                    me.inputEl.setStyle({backgroundColor:value});
                    picker.hide();
                },
                show: function(field){
                    field.getEl().monitorMouseLeave(500, field.hide, field);
                }
            }
        });
        picker.alignTo(me.inputEl, 'tl-bl?');
        picker.show(me.inputEl);
    }
});
