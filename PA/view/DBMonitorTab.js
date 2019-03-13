/**
 * Created by JONGHO on 14. 3. 24.
 */
Ext.define("view.DBMonitorTab", {
    extend : "Exem.Form",
    width  : '100%',
    height : '100%',
    init: function() {
         var showBtn = Ext.create('Ext.button.Button',{
             text: 'DB Monitor',
             listeners: {
                 click: function() {
                     var dbMo = Ext.create('view.DBMonitor2');
                     dbMo.init();

                 }
             }
         });
        this.add(showBtn);
    }
});