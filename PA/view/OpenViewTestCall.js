Ext.define('view.OpenViewTestCall', {
    extend: 'Exem.FormOnCondition',
    title: 'test origin title',

    init: function() {
        common.OpenView.open('OpenViewTestTarget', {
            isWindow: true,
            width: 500,
            height: 500,
            config: {
                testConf: 'overwrite',
                title: 'overwrite title'
            }
        });
    }
});