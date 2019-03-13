function Area() {
    this.id = _.uniqueId('Area');
    this.sheetName = null;
    this.chartData = null;
    this.maxChartDataLen = 0;
    this.groupType = 'standard';
    this._catAx = {
        fontSize : '900',
        numFmt : {
            sourceLinked : '1',
            formatCode : 'General'
        },
        min : null,
        max : null,
        tickLblSkip : null
    };
    this._valAx = {
        fontSize : '900',
        numFmt : {
            sourceLinked : '1',
            formatCode : 'General'
        },
        min : '0',
        max : null
    };
    this.legend = {
        positon : 'r'
    };
    this.colorList = [];
}

_.extend(Area.prototype, {
    setSheetName: function(name){
        this.sheetName = name;
    },

    setChartData: function(data, length){
        this.chartData = data;
        this.maxChartDataLen = length;
    },

    setColorList: function(colorList){
        this.colorList = colorList;
    },

    setChartGroupType: function(groupType){
        this.groupType = groupType;
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
    setLegend_Position: function(val){
        this.legend.positon = val;
    },

    setTitle: function(xmlDoc){
        var title = util.createElement(xmlDoc, 'c:title');

        title.appendChild(util.createElement(xmlDoc, 'c:layout'));
        title.appendChild(util.createElement(xmlDoc, 'c:overlay', [
            ['val', '0']
        ]));
        title.appendChild(this.getShapeProperties(xmlDoc, {}, null, {}, null, null));
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
            ['val', '0']
        ]));
        catAx.appendChild(util.createElement(xmlDoc, 'c:axPos', [
            ['val', 'b']
        ]));
        catAx.appendChild(util.createElement(xmlDoc, 'c:numFmt', [
            ['sourceLinked', this._catAx.numFmt.sourceLinked],
            ['formatCode', this._catAx.numFmt.formatCode]
        ]));
        catAx.appendChild(util.createElement(xmlDoc, 'c:majorTickMark', [
            ['val', 'out']
        ]));
        catAx.appendChild(util.createElement(xmlDoc, 'c:minorTickMark', [
            ['val', 'none']
        ]));
        catAx.appendChild(util.createElement(xmlDoc, 'c:tickLblPos', [
            ['val', 'nextTo']
        ]));
        catAx.appendChild(this.getShapeProperties(xmlDoc, {}, 'tx1', {w: '9525', cap:'flat', cmpd:'sng', algn:'ctr'}, '15000', '85000'));
        catAx.appendChild(this.getTextProperties(xmlDoc, this._catAx.fontSize));
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
        var valAx = util.createElement(xmlDoc, 'c:valAx');

        var scaling = util.createElement(xmlDoc, 'c:scaling');
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

        var majorGridlines = util.createElement(xmlDoc, 'c:majorGridlines');
        majorGridlines.appendChild(this.getShapeProperties(xmlDoc, {}, 'tx1', {w: '9525', cap:'flat', cmpd:'sng', algn:'ctr'}, '15000', '85000'));

        valAx.appendChild(util.createElement(xmlDoc, 'c:axId', [
            ['val', '235867776']
        ]));
        valAx.appendChild(scaling);
        valAx.appendChild(util.createElement(xmlDoc, 'c:delete', [
            ['val', '0']
        ]));
        valAx.appendChild(util.createElement(xmlDoc, 'c:axPos', [
            ['val', 'l']
        ]));
        valAx.appendChild(majorGridlines);
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
        valAx.appendChild(this.getShapeProperties(xmlDoc, {}, null, {}, null, null));
        valAx.appendChild(this.getTextProperties(xmlDoc, this._valAx.fontSize));
        valAx.appendChild(util.createElement(xmlDoc, 'c:crossAx', [
            ['val', '235868896']
        ]));
        valAx.appendChild(util.createElement(xmlDoc, 'c:crosses', [
            ['val', 'autoZero']
        ]));
        valAx.appendChild(util.createElement(xmlDoc, 'c:crossBetween', [
            ['val', 'midCat']
        ]));

        return valAx;
    },

    getShapeProperties: function(xmlDoc, solidFillProp, ln_solidFillClr, lnProp, ln_lMod, ln_lOff){
        var spPr = util.createElement(xmlDoc, 'c:spPr');

        if(Object.keys(solidFillProp).length > 0){
            var solidFill = util.createElement(xmlDoc, 'a:solidFill');
            var solidFillClr = null;

            if(solidFillProp.schemeClr){
                solidFillClr = util.createElement(xmlDoc, 'a:schemeClr', [
                    ['val', solidFillProp.schemeClr.val]
                ]);

                if(solidFillProp.schemeClr.lMod){
                    solidFillClr.appendChild(util.createElement(xmlDoc, 'a:lumMod', [
                        ['val', solidFillProp.schemeClr.lMod]
                    ]));
                }
            }
            else if(solidFillProp.srgbClr){
                solidFillClr = util.createElement(xmlDoc, 'a:srgbClr', [
                    ['val', solidFillProp.srgbClr]
                ]);
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

            if(ln_lMod){
                ln_schemeClr.appendChild(util.createElement(xmlDoc, 'a:lumMod', [
                    ['val', ln_lMod]
                ]));
            }

            if(ln_lOff){
                ln_schemeClr.appendChild(util.createElement(xmlDoc, 'a:lumOff', [
                    ['val', ln_lOff]
                ]));
            }

            ln_solidFill.appendChild(ln_schemeClr);
            ln.appendChild(ln_solidFill);
        }
        else{
            ln.appendChild(util.createElement(xmlDoc, 'a:noFill'));
        }

        ln.appendChild(util.createElement(xmlDoc, 'a:round'));

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
        var Chart = util.createElement(xmlDoc, 'c:areaChart');
        Chart.appendChild(util.createElement(xmlDoc, 'c:grouping', [
            ['val', this.groupType]
        ]));
        Chart.appendChild(util.createElement(xmlDoc, 'c:varyColors', [
            ['val', '0']
        ]));

        var catFormula = null;
        var valFormula = new Array(this.chartData[0].length - 1);
        var txFormula = new Array(this.chartData[0].length - 1);

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

        //var dLbls = util.createElement(xmlDoc, 'c:dLbls');
        //dLbls.appendChild(util.createElement(xmlDoc, 'c:showLegendKey', [
        //    ['val', '0']
        //]));
        //dLbls.appendChild(util.createElement(xmlDoc, 'c:showVal', [
        //    ['val', '0']
        //]));
        //dLbls.appendChild(util.createElement(xmlDoc, 'c:showCatName', [
        //    ['val', '0']
        //]));
        //dLbls.appendChild(util.createElement(xmlDoc, 'c:showSerName', [
        //    ['val', '0']
        //]));
        //dLbls.appendChild(util.createElement(xmlDoc, 'c:showPercent', [
        //    ['val', '0']
        //]));
        //dLbls.appendChild(util.createElement(xmlDoc, 'c:showBubbleSize', [
        //    ['val', '0']
        //]));
        //dLbls.appendChild(util.createElement(xmlDoc, 'c:showLeaderLines', [
        //    ['val', '0']
        //]));
        //Chart.appendChild(dLbls);

        Chart.appendChild(util.createElement(xmlDoc, 'c:axId', [
            ['val', '235868896']
        ]));
        Chart.appendChild(util.createElement(xmlDoc, 'c:axId', [
            ['val', '235867776']
        ]));

        return Chart;
    },

    setLegend: function(xmlDoc){
        var legend = util.createElement(xmlDoc, 'c:legend');

        legend.appendChild(util.createElement(xmlDoc, 'c:legendPos', [
            ['val', this.legend.positon]
        ]));
        legend.appendChild(util.createElement(xmlDoc, 'c:layout'));
        legend.appendChild(util.createElement(xmlDoc, 'c:overlay', [
            ['val', '0']
        ]));

        legend.appendChild(this.getShapeProperties(xmlDoc, {}, null, {}, null, null));
        legend.appendChild(this.getTextProperties(xmlDoc, this._catAx.fontSize));

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

        var solidFillProp = {};
        if(this.colorList.length > 0){
            solidFillProp.srgbClr = this.colorList[seq];
        }
        else{
            solidFillProp.schemeClr = {};
            solidFillProp.schemeClr.val = 'accent' + (seq % 6 + 1);
            solidFillProp.schemeClr.lMod = null;
            if(seq != 0 && (seq / 6) >= 1){
                solidFillProp.schemeClr.lMod = Math.floor(seq / 6) * 60000 + '';
            }
        }

        series.appendChild(this.getShapeProperties(xmlDoc, solidFillProp, null, {}, null, null));

        series.appendChild(category);
        series.appendChild(value);

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
        var chartType = this.setChart(xmlDoc);



        PlotArea.appendChild(util.createElement(xmlDoc, 'c:layout'));
        PlotArea.appendChild(chartType);

        PlotArea.appendChild(this.setCatAx(xmlDoc));
        PlotArea.appendChild(this.setValAx(xmlDoc));

        var chartLegend = this.setLegend(xmlDoc);

        chart.appendChild(util.createElement(xmlDoc, 'c:autoTitleDeleted', [
            ['val', '0']
        ]));
        chart.appendChild(PlotArea);
        chart.appendChild(chartLegend);
        chart.appendChild(util.createElement(xmlDoc, 'c:plotVisOnly', [
            ['val', 1]
        ]));
        chart.appendChild(util.createElement(xmlDoc, 'c:dispBlanksAs', [
            ['val', 'gap']
        ]));

        chartSpace.appendChild(chart);

        var solidFillProp = {};

        solidFillProp.schemeClr = {};
        solidFillProp.schemeClr.val = 'bg1';
        solidFillProp.schemeClr.lMod = null;

        chartSpace.appendChild(this.getShapeProperties(xmlDoc, solidFillProp, 'tx1', {w: '9525', cap:'flat', cmpd:'sng', algn:'ctr'}, '15000', '85000'));

        return chartSpace;
    }
});