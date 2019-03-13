function Line() {
    this.id = _.uniqueId('Line');
    this.sheetName = null;
    this.chartData = null;
    this.maxChartDataLen = 0;
    this.chartType = null;
    this.autoTitleDeleted = false;
    this._catAx = {
        fontSize : '900',
        numFmt : {
            sourceLinked : '1',
            formatCode : 'General'
        },
        min : null,
        max : null,
        tickLblSkip : null,
        delete: '0'
    };
    this._valAx = {
        fontSize : '900',
        numFmt : {
            sourceLinked : '0',
            formatCode : '[>=1000000]#0.0,,"M";[>=1000]#0.0,"k";General'
        },
        min : '0',
        max : null,
        delete: '0'
    };
    this.legend = {
        positon : 'r',
        visible : true
    };
}

_.extend(Line.prototype, {
    setSheetName: function(name){
        this.sheetName = name;
    },

    setChartData: function(data, length){
        this.chartData = data;
        this.maxChartDataLen = length;
    },

    setCatAx_fontSize: function(val){
        this._catAx.fontSize = val;
    },
    setCatAx_numFmt: function(source, formatCode){
        this._catAx.numFmt.formatCode = formatCode;
        this._catAx.numFmt.sourceLinked = source;
    },
    setCatAx_minMax: function(min, max){
        this._catAx.min = min;
        this._catAx.max = max;
    },
    setCatAx_tickLblSkip: function(val){
        this._catAx.tickLblSkip = val;
    },
    setCatAx_visible: function(status) {
        if (!status) {
            this._catAx.delete = '1';
        }
    },

    setValAx_fontSize: function(val){
        this._valAx.fontSize = val;
    },
    setValAx_numFmt: function(source, formatCode){
        this._valAx.numFmt.formatCode = formatCode;
        this._valAx.numFmt.sourceLinked = source;
    },
    setValAx_minMax: function(min, max){
        this._valAx.min = min;
        this._valAx.max = max;
    },
    setValAx_visible: function(status) {
        if (!status) {
            this._valAx.delete = '1';
        }
    },

    setLegend_Position: function(val){
        this.legend.positon = val;
    },

    setLegendVisible: function(val){
        this.legend.visible = val;
    },

    setAutoTitleDeleted : function(val) {
        this.autoTitleDeleted = val;
    },

    setTitle: function(xmlDoc){
        var title = util.createElement(xmlDoc, 'c:title');

        title.appendChild(util.createElement(xmlDoc, 'c:layout'));
        title.appendChild(util.createElement(xmlDoc, 'c:overlay', [
            ['val', '0']
        ]));
        title.appendChild(this.getShapeProperties(xmlDoc, null, null, {}, null, null));
        title.appendChild(this.getTextProperties(xmlDoc, '1400'));

        return title;
    },

    setCatAx: function(xmlDoc){
        var catAx = util.createElement(xmlDoc, 'c:catAx');

        var scaling = util.createElement(xmlDoc, 'c:scaling');
        scaling.appendChild(util.createElement(xmlDoc, 'c:orientation', [
            ['val', 'minMax']
        ]));

        if(this._catAx.min){
            scaling.appendChild(util.createElement(xmlDoc, 'c:min', [
                ['val', this._catAx.min]
            ]));
        }

        if(this._catAx.max){
            scaling.appendChild(util.createElement(xmlDoc, 'c:max', [
                ['val', this._catAx.max]
            ]));
        }

        catAx.appendChild(util.createElement(xmlDoc, 'c:axId', [
            ['val', '235868896']
        ]));
        catAx.appendChild(scaling);
        catAx.appendChild(util.createElement(xmlDoc, 'c:delete', [
            ['val', this._catAx.delete]
        ]));
        catAx.appendChild(util.createElement(xmlDoc, 'c:axPos', [
            ['val', 'b']
        ]));
        catAx.appendChild(util.createElement(xmlDoc, 'c:numFmt', [
            ['sourceLinked', this._catAx.numFmt.sourceLinked],
            ['formatCode', this._catAx.numFmt.formatCode]
        ]));
        catAx.appendChild(util.createElement(xmlDoc, 'c:majorTickMark', [
            ['val', 'none']
        ]));
        catAx.appendChild(util.createElement(xmlDoc, 'c:minorTickMark', [
            ['val', 'none']
        ]));
        catAx.appendChild(util.createElement(xmlDoc, 'c:tickLblPos', [
            ['val', 'nextTo']
        ]));

        // if (!+this._catAx.delete) {
            catAx.appendChild(this.getShapeProperties(xmlDoc, null, 'tx1', {w: '9525', cap:'flat', cmpd:'sng', algn:'ctr'}, '15000', '85000'));
            catAx.appendChild(this.getTextProperties(xmlDoc, this._catAx.fontSize));
        // }

        catAx.appendChild(util.createElement(xmlDoc, 'c:crossAx', [
            ['val', '235867776']
        ]));
        catAx.appendChild(util.createElement(xmlDoc, 'c:crosses', [
            ['val', 'autoZero']
        ]));
        catAx.appendChild(util.createElement(xmlDoc, 'c:auto', [
            ['val', '1']
        ]));
        catAx.appendChild(util.createElement(xmlDoc, 'c:lblAlgn', [
            ['val', 'ctr']
        ]));
        catAx.appendChild(util.createElement(xmlDoc, 'c:lblOffset', [
            ['val', '100']
        ]));

        if(this._catAx.tickLblSkip){
            catAx.appendChild(util.createElement(xmlDoc, 'c:tickLblSkip', [
                ['val', this._catAx.tickLblSkip]
            ]));
        }

        catAx.appendChild(util.createElement(xmlDoc, 'c:noMultiLvlLbl', [
            ['val', '0']
        ]));

        return catAx;
    },

    setValAx: function(xmlDoc){
        var valAx = util.createElement(xmlDoc, 'c:valAx'),
            scaling = util.createElement(xmlDoc, 'c:scaling'),
            majorGridlines;

        scaling.appendChild(util.createElement(xmlDoc, 'c:orientation', [
            ['val', 'minMax']
        ]));
        if(this._valAx.min){
            scaling.appendChild(util.createElement(xmlDoc, 'c:min', [
                ['val', this._valAx.min]
            ]));
        }

        if(this._valAx.max){
            scaling.appendChild(util.createElement(xmlDoc, 'c:max', [
                ['val', this._valAx.max]
            ]));
        }

        if (!+this._valAx.delete) {
            majorGridlines = util.createElement(xmlDoc, 'c:majorGridlines');
            majorGridlines.appendChild(this.getShapeProperties(xmlDoc, null, 'tx1', {w: '9525', cap:'flat', cmpd:'sng', algn:'ctr'}, '15000', '85000'));
            valAx.appendChild(majorGridlines);
        }

        valAx.appendChild(this.getShapeProperties(xmlDoc, null, null, {}, null, null));
        valAx.appendChild(this.getTextProperties(xmlDoc, this._valAx.fontSize));

        valAx.appendChild(util.createElement(xmlDoc, 'c:axId', [
            ['val', '235867776']
        ]));
        valAx.appendChild(scaling);
        valAx.appendChild(util.createElement(xmlDoc, 'c:delete', [
            ['val', this._valAx.delete]
        ]));
        valAx.appendChild(util.createElement(xmlDoc, 'c:axPos', [
            ['val', 'l']
        ]));

        valAx.appendChild(util.createElement(xmlDoc, 'c:numFmt', [
            ['sourceLinked', this._valAx.numFmt.sourceLinked],
            ['formatCode', this._valAx.numFmt.formatCode]
        ]));
        valAx.appendChild(util.createElement(xmlDoc, 'c:majorTickMark', [
            ['val', 'none']
        ]));
        valAx.appendChild(util.createElement(xmlDoc, 'c:minorTickMark', [
            ['val', 'none']
        ]));
        valAx.appendChild(util.createElement(xmlDoc, 'c:tickLblPos', [
            ['val', 'nextTo']
        ]));

        valAx.appendChild(util.createElement(xmlDoc, 'c:crossAx', [
            ['val', '235868896']
        ]));
        valAx.appendChild(util.createElement(xmlDoc, 'c:crosses', [
            ['val', 'autoZero']
        ]));
        valAx.appendChild(util.createElement(xmlDoc, 'c:crossBetween', [
            ['val', 'between']
        ]));

        return valAx;
    },

    getShapeProperties: function(xmlDoc, solidFillClr, ln_solidFillClr, lnProp, lMod, lOff, type){
        var spPr = util.createElement(xmlDoc, 'c:spPr');

        if(solidFillClr){
            var solidFill = util.createElement(xmlDoc, 'a:solidFill');
            var solidFillClr = util.createElement(xmlDoc, 'a:schemeClr', [
                ['val', solidFillClr]
            ]);

            if(lMod && type == 'marker'){
                solidFillClr.appendChild(util.createElement(xmlDoc, 'a:lumMod', [
                    ['val', lMod]
                ]));
            }

            solidFill.appendChild(solidFillClr);
            spPr.appendChild(solidFill);
        }
        else{
            spPr.appendChild(util.createElement(xmlDoc, 'a:noFill'));
        }

        var ln = util.createElement(xmlDoc, 'a:ln');
        if(lnProp.w){
            ln.setAttribute('w', lnProp.w);
        }
        if(lnProp.cap){
            ln.setAttribute('cap', lnProp.cap);
        }
        if(lnProp.cmpd){
            ln.setAttribute('cmpd', lnProp.cmpd);
        }
        if(lnProp.algn){
            ln.setAttribute('algn', lnProp.algn);
        }

        if(ln_solidFillClr){
            var ln_solidFill = util.createElement(xmlDoc, 'a:solidFill');
            var ln_schemeClr = util.createElement(xmlDoc, 'a:schemeClr', [
                ['val', ln_solidFillClr]
            ]);

            if(lMod){
                ln_schemeClr.appendChild(util.createElement(xmlDoc, 'a:lumMod', [
                    ['val', lMod]
                ]));
            }

            if(lOff){
                ln_schemeClr.appendChild(util.createElement(xmlDoc, 'a:lumOff', [
                    ['val', lOff]
                ]));
            }

            ln_solidFill.appendChild(ln_schemeClr);
            ln.appendChild(ln_solidFill);
        }
        else{
            ln.appendChild(util.createElement(xmlDoc, 'a:noFill'));
        }

        //ln.appendChild(util.createElement(xmlDoc, 'a:round'));

        spPr.appendChild(ln);
        spPr.appendChild(util.createElement(xmlDoc, 'a:effectLst'));

        return spPr;
    },

    getTextProperties: function(xmlDoc, fontSize){
        var txPr = util.createElement(xmlDoc, 'c:txPr');
        var bodyPr = util.createElement(xmlDoc, 'a:bodyPr', [
            ['rot', '0'],
            ['spcFirstLastPara', '1'],
            ['vertOverflow', 'ellipsis'],
            ['vert', 'horz'],
            ['wrap', 'square'],
            ['anchor', 'ctr'],
            ['anchorCtr', '1']
        ]);
        var p = util.createElement(xmlDoc, 'a:p');
        var pPr = util.createElement(xmlDoc, 'a:pPr');
        var defRPr = util.createElement(xmlDoc, 'a:defRPr', [
            ['sz', fontSize],
            ['b', '0'],
            ['i', '0'],
            ['u', 'none'],
            ['strike', 'noStrike'],
            ['kern', '1200'],
            ['spc', '0'],
            ['baseline', '0']
        ]);
        var solidFill = util.createElement(xmlDoc, 'a:solidFill');
        var schemaClr = util.createElement(xmlDoc, 'a:schemeClr', [
            ['val', 'tx1']
        ]);
        schemaClr.appendChild(util.createElement(xmlDoc, 'a:lumMod', [
            ['val', '65000']
        ]));
        schemaClr.appendChild(util.createElement(xmlDoc, 'a:lumOff', [
            ['val', '35000']
        ]));

        solidFill.appendChild(schemaClr);

        defRPr.appendChild(solidFill);
        defRPr.appendChild(util.createElement(xmlDoc, 'a:latin', [
            ['typeface', '+mn-lt']
        ]));
        defRPr.appendChild(util.createElement(xmlDoc, 'a:ea', [
            ['typeface', '+mn-ea']
        ]));
        defRPr.appendChild(util.createElement(xmlDoc, 'a:cs', [
            ['typeface', '+mn-cs']
        ]));

        pPr.appendChild(defRPr);

        p.appendChild(pPr);
        p.appendChild(util.createElement(xmlDoc, 'a:endParaRPr', [
            ['lang', 'ko-KR']
        ]));

        txPr.appendChild(bodyPr);
        txPr.appendChild(util.createElement(xmlDoc, 'a:lstStyle'));
        txPr.appendChild(p);

        return txPr;
    },

    setChart: function(xmlDoc){
        var Chart = util.createElement(xmlDoc, 'c:lineChart');
        var grouping = util.createElement(xmlDoc, 'c:grouping', [
            ['val', 'standard']
        ]);

        Chart.appendChild(grouping);

        var catFormula = null;
        var valFormula = new Array(this.chartData[0].length - 1);
        var txFormula = new Array(this.chartData[0].length - 1);

        if(txFormula.length == 1) {
            Chart.appendChild(util.createElement(xmlDoc, 'c:varyColors', [
                ['val', '0']
            ]));
        }

        for(var col = 0, colLen = this.chartData[0].length; col < colLen; col++)
        {
            if(col == 0){
                catFormula = '\''+ this.sheetName + '\'' + '!' + util.positionToLetterRef(1, 2) + ':' + util.positionToLetterRef(1, this.maxChartDataLen + 1);
            }
            else{
                txFormula[col - 1] = '\''+ this.sheetName + '\'' + '!' + util.positionToLetterRef(col + 1, 1);
                valFormula[col - 1] = '\''+ this.sheetName + '\'' + '!' + util.positionToLetterRef(col + 1, 2) + ':' + util.positionToLetterRef(col + 1, this.maxChartDataLen + 1);
            }
        }

        for(var ix = 0; ix < txFormula.length; ix++){
            Chart.appendChild(this.addSeries(xmlDoc, txFormula[ix], catFormula, valFormula[ix], ix));
        }

        Chart.appendChild(util.createElement(xmlDoc, 'c:marker', [
            ['val', '1']
        ]));
        Chart.appendChild(util.createElement(xmlDoc, 'c:smooth', [
            ['val', '1']
        ]));

        return Chart;
    },

    setLegend: function(xmlDoc){
        var legend = util.createElement(xmlDoc, 'c:legend'),
            overlay = '0',
            layout, manualLayout;

        legend.appendChild(util.createElement(xmlDoc, 'c:legendPos', [
            ['val', this.legend.positon]
        ]));

        layout = util.createElement(xmlDoc, 'c:layout');
        // if (+this._valAx.delete && +this._catAx.delete) {
        //     manualLayout = util.createElement(xmlDoc, 'c:manualLayout');
        //     manualLayout.appendChild(util.createElement(xmlDoc, 'c:xMode', [
        //         ['val', 'edge']
        //     ]));
        //     manualLayout.appendChild(util.createElement(xmlDoc, 'c:yMode', [
        //         ['val', 'edge']
        //     ]));
        //     manualLayout.appendChild(util.createElement(xmlDoc, 'c:x', [
        //         ['val', '0.01']
        //     ]));
        //     manualLayout.appendChild(util.createElement(xmlDoc, 'c:y', [
        //         ['val', '0.01']
        //     ]));
        //     manualLayout.appendChild(util.createElement(xmlDoc, 'c:w', [
        //         ['val', '1']
        //     ]));
        //     manualLayout.appendChild(util.createElement(xmlDoc, 'c:h', [
        //         ['val', '1']
        //     ]));
        //
        //     layout.appendChild(manualLayout);
        //     // overlay = '1';
        // }

        legend.appendChild(layout);
        legend.appendChild(util.createElement(xmlDoc, 'c:overlay', [
            ['val', '0']
        ]));


        return legend;
    },

    addSeries: function(xmlDoc, txFormula, catFormula, valFormula, seq){
        var series = util.createElement(xmlDoc, 'c:ser');

        var tx = util.createElement(xmlDoc, 'c:tx');
        var txStrRef = util.createElement(xmlDoc, 'c:strRef');
        var txF = util.createElement(xmlDoc, 'c:f');
        txF.appendChild(xmlDoc.createTextNode(txFormula));

        txStrRef.appendChild(txF);

        tx.appendChild(txStrRef);

        var category = util.createElement(xmlDoc, 'c:cat');
        var strRef = util.createElement(xmlDoc, 'c:strRef');
        var categoryF = util.createElement(xmlDoc, 'c:f');
        categoryF.appendChild(xmlDoc.createTextNode(catFormula));

        strRef.appendChild(categoryF);

        category.appendChild(strRef);

        var value = util.createElement(xmlDoc, 'c:val');
        var numRef = util.createElement(xmlDoc, 'c:numRef');
        var valueF = util.createElement(xmlDoc, 'c:f');
        valueF.appendChild(xmlDoc.createTextNode(valFormula));

        numRef.appendChild(valueF);

        value.appendChild(numRef);

        series.appendChild(util.createElement(xmlDoc, 'c:idx', [
            ['val', seq + '']
        ]));
        series.appendChild(util.createElement(xmlDoc, 'c:order', [
            ['val', seq + '']
        ]));
        series.appendChild(tx);
        var schemeClr = 'accent' + (seq % 6 + 1);
        var lumMod = null;
        if(seq != 0 && (seq / 6) >= 1){
            lumMod = Math.floor(seq / 6) * 60000 + '';
        }
        series.appendChild(this.getShapeProperties(xmlDoc, null, schemeClr, {w: '28575', cap: 'rnd'}, lumMod, null));

        var marker = util.createElement(xmlDoc, 'c:marker');
        marker.appendChild(util.createElement(xmlDoc, 'c:symbol', [
            ['val', 'circle']
        ]));
        marker.appendChild(util.createElement(xmlDoc, 'c:size', [
            ['val', '5']
        ]));
        marker.appendChild(this.getShapeProperties(xmlDoc, schemeClr, schemeClr, {w:'9525'}, lumMod, null, 'marker'));

        series.appendChild(marker);

        series.appendChild(category);
        series.appendChild(value);

        series.appendChild(util.createElement(xmlDoc, 'c:smooth', [
            ['val', '1']
        ]));

        return series;
    },

    toXML: function () {
        var xmlDoc = util.createXmlDoc();
        var chartSpace = util.createElement(xmlDoc, 'c:chartSpace', [
            ['xmlns:r', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'],
            ['xmlns:a', 'http://schemas.openxmlformats.org/drawingml/2006/main'],
            ['xmlns:c', 'http://schemas.openxmlformats.org/drawingml/2006/chart']
        ]);

        chartSpace.appendChild(util.createElement(xmlDoc, 'c:roundedCorners', [
            ['val', '0']
        ]));

        var chart = util.createElement(xmlDoc, 'c:chart');
        var PlotArea = util.createElement(xmlDoc, 'c:plotArea');
        var chartType = this.setChart(xmlDoc),
            layout, manualLayout;

        chartType.appendChild(util.createElement(xmlDoc, 'c:axId', [
            ['val', '235868896']
        ]));
        chartType.appendChild(util.createElement(xmlDoc, 'c:axId', [
            ['val', '235867776']
        ]));

        layout = util.createElement(xmlDoc, 'c:layout');
        // if (+this._valAx.delete && +this._catAx.delete) {
        //
        //     manualLayout = util.createElement(xmlDoc, 'c:manualLayout');
        //     manualLayout.appendChild(util.createElement(xmlDoc, 'c:xMode', [
        //         ['val', 'edge']
        //     ]));
        //     manualLayout.appendChild(util.createElement(xmlDoc, 'c:yMode', [
        //         ['val', 'edge']
        //     ]));
        //     manualLayout.appendChild(util.createElement(xmlDoc, 'c:x', [
        //         ['val', '0.9']
        //     ]));
        //     manualLayout.appendChild(util.createElement(xmlDoc, 'c:y', [
        //         ['val', '0.9']
        //     ]));
        //     manualLayout.appendChild(util.createElement(xmlDoc, 'c:w', [
        //         ['val', '0.01']
        //     ]));
        //     manualLayout.appendChild(util.createElement(xmlDoc, 'c:h', [
        //         ['val', '0.01']
        //     ]));
        //
        //     layout.appendChild(manualLayout);
        // }

        PlotArea.appendChild(layout);
        PlotArea.appendChild(chartType);

        PlotArea.appendChild(this.setCatAx(xmlDoc));
        PlotArea.appendChild(this.setValAx(xmlDoc));

        var chartLegend;
        if(this.legend.visible){
            chartLegend = this.setLegend(xmlDoc);
        }

        chart.appendChild(util.createElement(xmlDoc, 'c:autoTitleDeleted', [
            ['val', this.autoTitleDeleted ? '1' : '0']
        ]));
        chart.appendChild(PlotArea);
        if(this.legend.visible){
            chart.appendChild(chartLegend);
        }
        chart.appendChild(util.createElement(xmlDoc, 'c:plotVisOnly', [
            ['val', 1]
        ]));
        chart.appendChild(util.createElement(xmlDoc, 'c:dispBlanksAs', [
            ['val', 'gap']
        ]));

        chartSpace.appendChild(chart);
        chartSpace.appendChild(this.getShapeProperties(xmlDoc, 'bg1', 'tx1', {w: '9525', cap:'flat', cmpd:'sng', algn:'ctr'}, '15000', '85000'));

        return chartSpace;
    }
});