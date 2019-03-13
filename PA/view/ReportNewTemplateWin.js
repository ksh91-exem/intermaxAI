/**
 * Created by Kang on 2017-06-19.
 */

Ext.define('view.ReportNewTemplateWin', {
    extend      : 'Exem.XMWindow',
    title       : common.Util.TR('New Template'),
    width       : 1150,
    height      : 880,
    minWidth    : 600,
    minHeight   : 500,
    layout      : 'fit',
    minimizable : false,
    maximizable : false,
    closable    : true,
    modal       : true,
    cls         : null,

    parent          : null,
    templateSeq     : null,
    templateOptions : null,
    timeWindowCheck : false,

    init: function() {
        this._initLayout();
    },

    _initLayout: function() {
        this.mainBackgroundCon = Ext.create( 'view.ReportTemplateForm', {
            parent         : this,
            flex           : 1,
            reportType     : 1,
            padding        : '20 0 0 0',
            templateSeq    : this.templateSeq,
            templateOptions: this.templateOptions,
            useDefaultStat : this.useDefaultStat,
            timeWindowCheck: this.timeWindowCheck
        });

        this.mainBackgroundCon.init();
        this.add( this.mainBackgroundCon );
    }
});