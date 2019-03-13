Ext.define('view.OpenViewTestTarget', {
    extend: 'Exem.FormOnCondition',

    testConf: 'origin',
    testConf2: 'origin',
    title: 'origin title',

    init: function() {
//        this.testConf = 'overwrite in init';
        console.error('view.OpenViewTestTarget');
        console.error('dump class :', this);
    }
});