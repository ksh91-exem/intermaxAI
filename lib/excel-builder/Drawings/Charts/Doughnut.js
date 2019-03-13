function Doughnut() {
    this.id = _.uniqueId('Doughnut');
    this.sheetName = null;
    this.chartData = null;
    this.maxChartDataLen = 0;
    this.chartType = null;
    this.legend = {
        positon : 'r'
    };
    this.colorList = [];
}

_.extend(Doughnut.prototype, {
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
    setLegend_Position: function(val){
        this.legend.positon = val;
    },
    setCatAx_tickLblSkip: function(val){
        //this._catAx.tickLblSkip = val;
    },

    setTitle: function(xmlDoc){
        var title = util.createElement(xmlDoc, 'c:title');

        title.appendChild(util.createElement(xmlDoc, 'c:layout'));
        title.appendChild(util.createElement(xmlDoc, 'c:overlay', [
            ['val', '0']
        ]));
        title.appendChild(this.getShapeProperties(xmlDoc, {}, null, {}, null, null));
        title.appendChild(this.getTextProperties(xmlDoc, {rot : '0'}, {fontSize : '1400', schemaClr : 'tx1'}));

        return title;
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

    getTextProperties: function(xmlDoc, bodyProp, defRProp){
        var txPr = util.createElement(xmlDoc, 'c:txPr');
        var bodyPr = null;
        if(Object.keys(bodyProp).length > 0){
            bodyPr = util.createElement(xmlDoc, 'a:bodyPr', [
                ['rot', bodyProp.rot],
                ['spcFirstLastPara', '1'],
                ['vertOverflow', 'ellipsis'],
                ['vert', 'horz'],
                ['wrap', 'square'],
                ['anchor', 'ctr'],
                ['anchorCtr', '1']
            ]);

            if(bodyProp.llns){
                bodyPr.setAttribute('llns', bodyProp.llns);
            }

            if(bodyProp.tlns){
                bodyPr.setAttribute('tlns', bodyProp.tlns);
            }

            if(bodyProp.rlns){
                bodyPr.setAttribute('rlns', bodyProp.rlns);
            }

            if(bodyProp.blns){
                bodyPr.setAttribute('blns', bodyProp.blns);
            }
        }
        else{
            bodyPr = util.createElement(xmlDoc, 'a:bodyPr');
        }

        var p = util.createElement(xmlDoc, 'a:p');
        var pPr = util.createElement(xmlDoc, 'a:pPr');
        var defRPr = null;

        if(Object.keys(defRProp).length > 0){
            defRPr = util.createElement(xmlDoc, 'a:defRPr', [
                ['sz', defRProp.fontSize],
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
                ['val', defRProp.schemaClr]
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
        }
        else{
            defRPr = util.createElement(xmlDoc, 'a:defRPr');
        }

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
        var Chart = util.createElement(xmlDoc, 'c:doughnutChart');
        Chart.appendChild(util.createElement(xmlDoc, 'c:varyColors', [
            ['val', '1']
        ]));

        var catFormula = '\''+ this.sheetName + '\'' + '!' + util.positionToLetterRef(1, 1) + ':' + util.positionToLetterRef(this.chartData[0].length, 1);
        var valFormula = '\''+ this.sheetName + '\'' + '!' + util.positionToLetterRef(1, 2) + ':' + util.positionToLetterRef(this.chartData[0].length, 2);

        Chart.appendChild(this.addSeries(xmlDoc, catFormula, valFormula));

        var dLbls = util.createElement(xmlDoc, 'c:dLbls');
        dLbls.appendChild(util.createElement(xmlDoc, 'c:showLegendKey', [
            ['val', '0']
        ]));
        dLbls.appendChild(util.createElement(xmlDoc, 'c:showVal', [
            ['val', '0']
        ]));
        dLbls.appendChild(util.createElement(xmlDoc, 'c:showCatName', [
            ['val', '0']
        ]));
        dLbls.appendChild(util.createElement(xmlDoc, 'c:showSerName', [
            ['val', '0']
        ]));
        dLbls.appendChild(util.createElement(xmlDoc, 'c:showPercent', [
            ['val', '0']
        ]));
        dLbls.appendChild(util.createElement(xmlDoc, 'c:showBubbleSize', [
            ['val', '0']
        ]));
        dLbls.appendChild(util.createElement(xmlDoc, 'c:showLeaderLines', [
            ['val', '0']
        ]));

        Chart.appendChild(util.createElement(xmlDoc, 'c:firstSliceAng', [
            ['val', '0']
        ]));
        Chart.appendChild(util.createElement(xmlDoc, 'c:holeSize', [
            ['val', '65']
        ]));
        Chart.appendChild(dLbls);

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
        legend.appendChild(this.getTextProperties(xmlDoc, {rot : '0'}, {fontSize : '900', schemaClr : 'tx1'}));

        return legend;
    },

    addSeries: function(xmlDoc, catFormula, valFormula){
        var series = util.createElement(xmlDoc, 'c:ser');

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
            ['val', '0']
        ]));
        series.appendChild(util.createElement(xmlDoc, 'c:order', [
            ['val', '0']
        ]));

        var ix;
        for(ix = 0; ix < this.chartData[0].length; ix++){
            var dPt = util.createElement(xmlDoc, 'c:dPt');
            dPt.appendChild(util.createElement(xmlDoc, 'c:idx', [
                ['val', ix + '']
            ]));
            dPt.appendChild(util.createElement(xmlDoc, 'c:bubble3D', [
                ['val', '0']
            ]));

            var solidFillProp = {};
            if(this.colorList.length > 0){
                solidFillProp.srgbClr = this.colorList[ix];
            }
            else{
                solidFillProp.schemeClr = {};
                solidFillProp.schemeClr.val = 'accent' + (ix % 6 + 1);
                solidFillProp.schemeClr.lMod = null;
                if(ix != 0 && (ix / 6) >= 1){
                    solidFillProp.schemeClr.lMod = Math.floor(ix / 6) * 60000 + '';
                }
            }

            dPt.appendChild(this.getShapeProperties(xmlDoc, solidFillProp, 'lt1', {w: '19050'}, null, null));
            series.appendChild(dPt);
        }

        var dLbls = util.createElement(xmlDoc, 'c:dLbls');
        dLbls.appendChild(this.getShapeProperties(xmlDoc, {}, null, {}, null, null));
        dLbls.appendChild(this.getTextProperties(xmlDoc, {rot : '0', llns : '38100', tlns : '19050', rlns : '38100', blns : '19050'}, {fontSize : '900', schemaClr : 'bg1'}));
        dLbls.appendChild(util.createElement(xmlDoc, 'c:showLegendKey', [
            ['val', '0']
        ]));
        dLbls.appendChild(util.createElement(xmlDoc, 'c:showVal', [
            ['val', '0']
        ]));
        dLbls.appendChild(util.createElement(xmlDoc, 'c:showCatName', [
            ['val', '0']
        ]));
        dLbls.appendChild(util.createElement(xmlDoc, 'c:showSerName', [
            ['val', '0']
        ]));
        dLbls.appendChild(util.createElement(xmlDoc, 'c:showPercent', [
            ['val', '1']
        ]));
        dLbls.appendChild(util.createElement(xmlDoc, 'c:showBubbleSize', [
            ['val', '0']
        ]));
        dLbls.appendChild(util.createElement(xmlDoc, 'c:showLeaderLines', [
            ['val', '1']
        ]));

        series.appendChild(dLbls);
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

        chartType.appendChild(util.createElement(xmlDoc, 'c:axId', [
            ['val', '235868896']
        ]));
        chartType.appendChild(util.createElement(xmlDoc, 'c:axId', [
            ['val', '235867776']
        ]));

        PlotArea.appendChild(util.createElement(xmlDoc, 'c:layout'));
        PlotArea.appendChild(chartType);
        PlotArea.appendChild(this.getShapeProperties(xmlDoc, {}, null, {}, null, null));

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
        chartSpace.appendChild(this.getTextProperties(xmlDoc, {}, {}));

        return chartSpace;
    }
});