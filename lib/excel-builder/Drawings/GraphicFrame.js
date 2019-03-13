function GraphicFrame() {
    this.id = _.uniqueId('GraphicFrame');
    this.chartId = {
        id : null
    };
    this.rid = null;
}

GraphicFrame.prototype = new Drawing();

_.extend(GraphicFrame.prototype, {
    setRelationshipId: function (rId) {
        this.rId = rId;
    },
    setChartId: function(chartId){
        this.chartId.id = chartId;
    },
    getMediaType: function(){
        return 'chartRelationship';
    },
    getChartId: function(){
       return this.chartId;
    },
    getDrawingType: function(){
        return 'Graphic'
    },
    toXML: function (xmlDoc) {
        var graphicFrameNode = util.createElement(xmlDoc, 'xdr:graphicFrame', [
            ['macro', '']
        ]);
        var nvGraphicFramePr = util.createElement(xmlDoc, 'xdr:nvGraphicFramePr');

        var cNvPr = util.createElement(xmlDoc, 'xdr:cNvPr', [
            ['name', 'chart'],
            ['id', '2']
        ]);
        var cNvGraphicFramePr = util.createElement(xmlDoc, 'xdr:cNvGraphicFramePr');
        var xfrm = util.createElement(xmlDoc, 'xdr:xfrm');
        var off = util.createElement(xmlDoc, 'a:off', [
            ['x', '0'],
            ['y', '0']
        ]);
        var ext = util.createElement(xmlDoc, 'a:ext', [
            ['cx', '0'],
            ['cy', '0']
        ]);
        xfrm.appendChild(off);
        xfrm.appendChild(ext);

        var graphic = util.createElement(xmlDoc, 'a:graphic');
        var graphicData = util.createElement(xmlDoc, 'a:graphicData', [
            ['uri', util.schemas['chart']]
        ]);
        var chart = util.createElement(xmlDoc, 'c:chart', [
            ['r:id', this.rId],
            ['xmlns:r', util.schemas['relationships']],
            ['xmlns:c', util.schemas['chart']]
        ]);

        graphicData.appendChild(chart);
        graphic.appendChild(graphicData);
        nvGraphicFramePr.appendChild(cNvPr);
        nvGraphicFramePr.appendChild(cNvGraphicFramePr);
        graphicFrameNode.appendChild(nvGraphicFramePr);
        graphicFrameNode.appendChild(xfrm);
        graphicFrameNode.appendChild(graphic);

        return this.anchor.toXML(xmlDoc, graphicFrameNode);
    }
});