Ext.define("Exem.ClassView", {
    extend: 'Exem.XMWindow',
    layout: 'vbox',
    maximizable: true,
    width: 800,
    height: 800,
    minWidth: 300,
    minHeight: 200,
    resizable: true,
    closeAction: 'destroy',
    title: common.Util.TR('Class View'),

    bodyStyle: { background: '#f5f5f5' },

    classmethod: '',
    wasid: '',
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    usefont: function(size, text, color) {
        var clr;
        if (color === undefined || color === null) {
            clr = '#000000';
        } else {
            clr = color;
        }
        return '<span style="padding-left: 0px; padding-top: 0px; font-family: Roboto Condensed; font-size: ' + size + 'px; color: ' + clr + '">' + text + '</span>';
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    init: function() {

        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.classNameLabel = this.usefont(12, common.Util.TR('Class Name') + ': ') + '&nbsp;';
        this.classPathLabel = this.usefont(12, common.Util.TR('Path') + ': ') + '&nbsp;';

        var panelA = Ext.create('Ext.panel.Panel', {
            layout: { type: 'vbox', pack: 'start', align: 'left' },
            cls: 'x-config-used-round-panel',
            width: '100%',
            height: 45,
            margin: '4 4 0 4',
            border: false,
            bodyStyle: { background: '#eeeeee' },
            items: [{
                xtype: 'label',
                margin: '5 5 0 5',
                itemId: 'labelClassName',
                html: this.classNameLabel
            }, {
                xtype: 'label',
                margin: '5 5 0 5',
                itemId: 'labelClassPath',
                html: this.classPathLabel
            }]
        });

        this.Editor = Ext.create('Exem.SyntaxEditor', {
            mode        : 'jade',
            width       : '100%',
            height      : '100%',
            readOnly    : true,
            autoScroll  : true
        });

        this.panelB = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            width: '100%',
            flex: 1,
            margin: '4 4 4 4',
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        this.panelB.add(this.Editor);

        this.show();

        this.add(panelA, this.panelB);

        this.loadingMask.show();

        this.call_execute();
    },

    call_execute: function() {
        var self = this;

        try {
            var AJSON = {};

            AJSON.dll_name = "IntermaxPlugin.dll";
            AJSON.options  = {
                was_id          : this.wasid,
                class_method    : this.classmethod,
                dbname          : localStorage.getItem('Intermax_MyRepository')
            };
            AJSON['function'] =  "class_file";

            WS.PluginFunction(AJSON, function (aheader, adata) {
                try {
                    if (adata.Values) {
                        var nameLabel = this.classNameLabel + this.usefont(12, adata.Values[2], '#3191C8');
                        var pathLabel = this.classPathLabel + this.usefont(12, adata.Values[3], '#3191C8');

                        this.down('#labelClassName').update(nameLabel);
                        this.down('#labelClassPath').update(pathLabel);

                        this.Editor.setText(adata.Values[1]);

                    } else {
                        this.Editor.emptyCheck() ;
                        self.loadingMask.hide();
                    }
                } catch (e) {
                    self.loadingMask.hide();
                } finally {
                    self.loadingMask.hide();
                }
            }, this);

        } catch(e) {
            this.loadingMask.hide();
        }

    }

});




