var originalFormat = Ext.util.Format.date;
Ext.override(Ext.util.Format, {
    date: function(v, format) {
        if (Ext.isIE && Ext.isString(v))
            v = new Date(v);

        return originalFormat(v, format);
    }
});