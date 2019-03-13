Ext.define('view.SelectService', {
    extend	: 'Exem.AbstractSelectService',
    hidden	: true,

    init: function() {
        var me = this;

        //setTimeout(function() {
        //    if( String(localStorage.getItem('Intermax_WSAddress')) == 'null' )
        //        me.configWS();
        //}, 200);

        var form = this.createServiceListForm();
        this.add(form);

        var cb = function(header, data) {
            form.fireEvent('ondata', data);
        };
        WS.SQLExec({
            sql: 'select service_name, service_id from xapm_service_info'
        }, cb);

        if(!Comm.isRandomMode)
            this.show();
        else
            common.DataModule.randomInit();
    }
});