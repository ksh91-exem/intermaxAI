Ext.define('view.ProcessingTest', {
    extend: 'Exem.Form',
    layout: 'vbox',
    minWidth: 1080,
    width: '100%',

    init: function() {
        var me = this;

        var ajax = function ajax(url) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, false);
            xhr.setRequestHeader("If-Modified-Since", "Fri, 01 Jan 1960 00:00:00 GMT");
            xhr.send(null);
            // failed request?
            if (xhr.status !== 200 && xhr.status !== 0) {
                throw ("XMLHttpRequest failed, status code " + xhr.status);
            }
            return xhr.responseText;
        };

        var addProcessingInstance = function(canvasID) {
            var canvas = document.getElementById(canvasID);
            // datasrc and data-src are deprecated.
            var processingSources = canvas.getAttribute('data-processing-sources');
            if (processingSources === null) {
                // Temporary fallback for datasrc and data-src
                processingSources = canvas.getAttribute('data-src');
                if (processingSources === null) {
                    processingSources = canvas.getAttribute('datasrc');
                }
            }
            if (processingSources) {
                // The problem: if the HTML canvas dimensions differ from the
                // dimensions specified in the size() call in the sketch, for
                // 3D sketches, browsers will either not render or render the
                // scene incorrectly. To fix this, we need to adjust the attributes
                // of the canvas width and height.
                // Get the source, we'll need to find what the user has used in size()
                var filenames = processingSources.split(' ');
                var code = "";
                for (var j = 0, fl = filenames.length; j < fl; j++) {
                    if (filenames[j]) {
                        var block = ajax(filenames[j]);
                        if (block !== false) {
                            code += ";\n" + block;
                        }
                    }
                }
                Processing.addInstance(new Processing(canvas, code));
            }
        };

        var canvasId = 'processingID';
        var contentBox = Ext.create('Exem.Container', {
            layout: 'fit',
            width: '100%',
            border: true,
            listeners: {
                afterrender: function() {
                    var c = document.createElement('canvas');
                    c.width = 1200;
                    c.height = 150;
                    c.id = canvasId;
                    c.setAttribute('data-processing-sources', 'noise.pjs');

                    this.getEl().appendChild(c);
                }
            }
        });
        this.add(contentBox);

        addProcessingInstance(canvasId);
    }
});