/**
 * This module represents an excel worksheet in its basic form - no tables, charts, etc. Its purpose is 
 * to hold data, the data's link to how it should be styled, and any links to other outside resources.
 * 
 * @module Excel/Worksheet
 */
function Worksheet(config) {
    this.relations = null;
    this.columnFormats = [];
    this.conditionFormats = [];
    this.data = [];
    this.mergedCells = [];
    this.columns = [];
    this._headers = [];
    this._footers = [];
    this._tables = [];
    this._drawings = [];
    this._charts = [];
    this._rowInstructions = {};

    this.initialize(config);
}

_.extend(Worksheet.prototype, {

    initialize: function (config) {
        config = config || {};
        this.name = config.name;
        this.id = _.uniqueId('Worksheet');
        if(config.state){
            this.state = config.state;
        }
        this._timezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;
        if(config.columns) {
            this.setColumns(config.columns);
        }

        this.relations = new RelationshipManager();
    },

    /**
     * Returns an object that can be consumed by a WorksheetExportWorker
     * @returns {Object}
     */
    exportData: function () {
        return {
            relations: this.relations.exportData(),
            columnFormats: this.columnFormats,
            data: this.data,
            columns: this.columns,
            mergedCells: this.mergedCells,
            _headers: this._headers,
            _footers: this._footers,
            _tables: this._tables,
            _rowInstructions: this._rowInstructions,
            name: this.name,
            id: this.id
        };
    },

    /**
     * Imports data - to be used while inside of a WorksheetExportWorker.
     * @param {Object} data
     */
    importData: function (data) {
        this.relations.importData(data.relations);
        delete data.relations;
        _.extend(this, data);
    },

    setSharedStringCollection: function (stringCollection) {
        this.sharedStrings = stringCollection;
    },

    addTable: function (table) {
        this._tables.push(table);
        this.relations.addRelation(table, 'table');
    },

    addDrawings: function (table) {
        this._drawings.push(table);
        this.relations.addRelation(table, 'drawingRelationship');
    },

    addCharts: function (table) {
        this._charts.push(table);
        this.relations.addRelation(table, 'chartRelationship');
    },

    addData: function (row, col, data){
        if(this.data[row]){
            this.data[row][col] = 0;
            this.data[row][col] = data;
        }
        else{
            this.data[row] = [];
            this.data[row][col] = 0;
            this.data[row][col] = data;
        }
    },

    addDatas: function (startRow, data){
        if(data.length == 0){
            return ;
        }

        for(var ix  = 0, ixLen = data.length; ix < ixLen; ix++){
            this.data[startRow + ix] = [];
            this.data[startRow + ix] = data[ix];
        }
    },

    setRowInstructions: function (rowIndex, instructions) {
        this._rowInstructions[rowIndex] = instructions;
    },

    /**
    * Expects an array length of three.
    *
    * @see Excel/Worksheet compilePageDetailPiece
    * @see <a href='/cookbook/addingHeadersAndFooters.html'>Adding headers and footers to a worksheet</a>
    *
    * @param {Array} headers [left, center, right]
    */
    setHeader: function (headers) {
        if(!_.isArray(headers)) {
            throw "Invalid argument type - setHeader expects an array of three instructions";
        }
        this._headers = headers;
    },

    /**
    * Expects an array length of three.
    *
    * @see Excel/Worksheet compilePageDetailPiece
    * @see <a href='/cookbook/addingHeadersAndFooters.html'>Adding headers and footers to a worksheet</a>
    *
    * @param {Array} footers [left, center, right]
    */
    setFooter: function (footers) {
        if(!_.isArray(footers)) {
            throw "Invalid argument type - setFooter expects an array of three instructions";
        }
        this._footers = footers;
    },

    /**
     * Turns page header/footer details into the proper format for Excel.
     * @param {type} data
     * @returns {String}
     */
    compilePageDetailPackage: function (data) {
        data = data || "";
        return [
        "&L", this.compilePageDetailPiece(data[0] || ""),
        "&C", this.compilePageDetailPiece(data[1] || ""),
        "&R", this.compilePageDetailPiece(data[2] || "")
        ].join('');
    },

    /**
     * Turns instructions on page header/footer details into something
     * usable by Excel.
     *
     * @param {type} data
     * @returns {String|@exp;_@call;reduce}
     */
    compilePageDetailPiece: function (data) {
        if(_.isString(data)) {
            return '&"-,Regular"'.concat(data);
        }
        if(_.isObject(data) && !_.isArray(data)) {
            var string = "";
            if(data.font || data.bold) {
                var weighting = data.bold ? "Bold" : "Regular";
                string += '&"' + (data.font || '-');
                string += ',' + weighting + '"';
            } else {
                string += '&"-,Regular"';
            }
            if(data.underline) {
                string += "&U";
            }
            if(data.fontSize) {
                string += "&"+data.fontSize;
            }
            string += data.text;

            return string;
        }

        if(_.isArray(data)) {
            var self = this;
            return _.reduce(data, function (m, v) {
                return m.concat(self.compilePageDetailPiece(v));
            }, "");
        }
    },

    /**
     * Creates the header node.
     *
     * @todo implement the ability to do even/odd headers
     * @param {XML Doc} doc
     * @returns {XML Node}
     */
    exportHeader: function (doc) {
        var oddHeader = doc.createElement('oddHeader');
        oddHeader.appendChild(doc.createTextNode(this.compilePageDetailPackage(this._headers)));
        return oddHeader;
    },

    /**
     * Creates the footer node.
     *
     * @todo implement the ability to do even/odd footers
     * @param {XML Doc} doc
     * @returns {XML Node}
     */
    exportFooter: function (doc) {
        var oddFooter = doc.createElement('oddFooter');
        oddFooter.appendChild(doc.createTextNode(this.compilePageDetailPackage(this._footers)));
        return oddFooter;
    },

    /**
     * This creates some nodes ahead of time, which cuts down on generation time due to
     * most cell definitions being essentially the same, but having multiple nodes that need
     * to be created. Cloning takes less time than creation.
     *
     * @private
     * @param {XML Doc} doc
     * @returns {_L8.Anonym$0._buildCache.Anonym$2}
     */
    _buildCache: function (doc) {
        var numberNode = doc.createElement('c');
        var value = doc.createElement('v');
        value.appendChild(doc.createTextNode("--temp--"));
        numberNode.appendChild(value);

        var formulaNode = doc.createElement('c');
        var formulaValue = doc.createElement('f');
        formulaValue.appendChild(doc.createTextNode("--temp--"));
        formulaNode.appendChild(formulaValue);

        var stringNode = doc.createElement('c');
        stringNode.setAttribute('t', 's');
        var stringValue = doc.createElement('v');
        stringValue.appendChild(doc.createTextNode("--temp--"));
        stringNode.appendChild(stringValue);


        return {
            number: numberNode,
            date: numberNode,
            string: stringNode,
            formula: formulaNode
        };
    },

    /**
     * Runs through the XML document and grabs all of the strings that will
     * be sent to the 'shared strings' document.
     *
     * @returns {Array}
     */
    collectSharedStrings: function () {
        var data = this.data;
        var maxX = 0;
        var strings = {};
        for(var row = 0, l = data.length; row < l; row++) {
            var dataRow = data[row];
            var cellCount = dataRow.length;
            maxX = cellCount > maxX ? cellCount : maxX;
            for(var c = 0; c < cellCount; c++) {
                var cellValue = dataRow[c];
                var metadata = cellValue && cellValue.metadata || {};
                if (cellValue && typeof cellValue === 'object') {
                    cellValue = cellValue.value;
                }

                if(!metadata.type) {
                    if(typeof cellValue === 'number') {
                        metadata.type = 'number';
                    }
                }
                if(metadata.type === "text" || !metadata.type) {
                    if(typeof strings[cellValue] === 'undefined') {
                        strings[cellValue] = true;
                    }
                }
            }
        }
        return _.keys(strings);
    },

    toXML: function () {
        var data = this.data;
        var columns = this.columns || [];
        var doc = util.createXmlDoc(util.schemas.spreadsheetml, 'worksheet');
        var worksheet = doc.documentElement;
        var i, l, row;
        worksheet.setAttribute('xmlns:r', util.schemas.relationships);
        worksheet.setAttribute('xmlns:mc', util.schemas.markupCompat);

        var maxX = 0;
        var sheetData = util.createElement(doc, 'sheetData');

        var cellCache = this._buildCache(doc);

        for(var row = 0; row < data.length; row++) {
            var dataRow = data[row];
            if(dataRow != null && dataRow != undefined){
                var cellCount = dataRow.length;
                maxX = cellCount > maxX ? cellCount : maxX;
                var rowNode = doc.createElement('row');

                for(var c = 0; c < cellCount; c++) {
                    var cellValue = dataRow[c];
                    var cell, metadata = cellValue && cellValue.metadata || {};

                    if(cellValue != null && cellValue != undefined){
                        //columns[c] = columns[c] || {};
                        if (cellValue && typeof cellValue === 'object') {
                            cellValue = cellValue.value;
                        }

                        if(!metadata.type) {
                            if(typeof cellValue === 'number') {
                                metadata.type = 'number';
                            }
                        }

                        switch(metadata.type) {
                            case "number":
                                cell = cellCache.number.cloneNode(true);
                                cell.firstChild.firstChild.nodeValue = cellValue;
                                break;
                            case "date":
                                cell = cellCache.date.cloneNode(true);
                                cell.firstChild.firstChild.nodeValue = 25569.0 + ((cellValue - this._timezoneOffset)  / (60 * 60 * 24 * 1000));
                                break;
                            case "formula":
                                cell = cellCache.formula.cloneNode(true);
                                cell.firstChild.firstChild.nodeValue = cellValue;
                                break;
                            case "text":
                                break;
                            /*falls through*/
                            default:
                                var id;
                                if(typeof this.sharedStrings.strings[cellValue] !== 'undefined') {
                                    id = this.sharedStrings.strings[cellValue];
                                } else {
                                    id = this.sharedStrings.addString(cellValue);
                                }
                                cell = cellCache.string.cloneNode(true);
                                cell.firstChild.firstChild.nodeValue = id;
                                break;
                        }
                        if(metadata.style) {
                            cell.setAttribute('s', metadata.style);
                        }
                        cell.setAttribute('r', util.positionToLetterRef(c + 1, row + 1));
                        rowNode.appendChild(cell);
                    }
                }
                rowNode.setAttribute('r', row + 1);

                if (this._rowInstructions[row]) {
                    var rowInst = this._rowInstructions[row];

                    if (rowInst.height !== undefined) {
                        rowNode.setAttribute('customHeight', '1');
                        rowNode.setAttribute('ht', rowInst.height);
                    }

                    if (rowInst.style !== undefined) {
                      rowNode.setAttribute('customFormat', '1');
                      rowNode.setAttribute('s', rowInst.style);
                    }
                }

                sheetData.appendChild(rowNode);
            }
        }

        if(maxX !== 0) {
            worksheet.appendChild(util.createElement(doc, 'dimension', [
                ['ref',  util.positionToLetterRef(1, 1) + ':' + util.positionToLetterRef(maxX, data.length)]
            ]));
        } else {
            worksheet.appendChild(util.createElement(doc, 'dimension', [
                ['ref',  util.positionToLetterRef(1, 1)]
            ]));
        }

        this.exportSheetView(doc, worksheet);

        if(this.columns.length) {
            worksheet.appendChild(this.exportColumns(doc));
        }
        worksheet.appendChild(sheetData);

        // 'mergeCells' should be written before 'headerFoot' and 'drawing' due to issue
        // with Microsoft Excel (2007, 2013)
        if (this.mergedCells.length > 0) {
            var mergeCells = doc.createElement('mergeCells');
            for (i = 0, l = this.mergedCells.length; i < l; i++) {
                var mergeCell = doc.createElement('mergeCell');
                mergeCell.setAttribute('ref', this.mergedCells[i][0] + ':' + this.mergedCells[i][1]);
                mergeCells.appendChild(mergeCell);
            }
            worksheet.appendChild(mergeCells);
        }

        this.exportConditionFormat(doc, worksheet);
        this.exportPageSettings(doc, worksheet);

        if(this._headers.length > 0 || this._footers.length > 0) {
            var headerFooter = doc.createElement('headerFooter');
            if(this._headers.length > 0) {
                headerFooter.appendChild(this.exportHeader(doc));
            }
            if(this._footers.length > 0) {
                headerFooter.appendChild(this.exportFooter(doc));
            }
            worksheet.appendChild(headerFooter);
        }

        // the 'drawing' element should be written last, after 'headerFooter', 'mergeCells', etc. due
        // to issue with Microsoft Excel (2007, 2013)
        for(i = 0, l = this._drawings.length; i < l; i++) {
            var drawing = doc.createElement('drawing');
            drawing.setAttribute('r:id', this.relations.getRelationshipId(this._drawings[i]));
            worksheet.appendChild(drawing);
        }

        for(i = 0, l = this._charts.length; i < l; i++) {
            var chart = doc.createElement('chart');
            chart.setAttribute('r:id', this.relations.getRelationshipId(this._charts[i]));
            worksheet.appendChild(chart);
        }

        if(this._tables.length > 0) {
            var tables = doc.createElement('tableParts');
            tables.setAttribute('count', this._tables.length);
            for(i = 0, l = this._tables.length; i < l; i++) {
                var table = doc.createElement('tablePart');
                table.setAttribute('r:id', this.relations.getRelationshipId(this._tables[i]));
                tables.appendChild(table);
            }
            worksheet.appendChild(tables);
        }

        if(this.conditionFormats.length > 0){
            this.exportExtLst(doc, worksheet);
        }

        return doc;
    },

    /**
     *
     * @param {XML Doc} doc
     * @returns {XML Node}
     */
    exportColumns: function (doc) {
        var cols = util.createElement(doc, 'cols');
        for(var i = 0, l = this.columns.length; i < l; i++) {
            if (this.columns[i]) {
                var cd = this.columns[i];
                var col = util.createElement(doc, 'col', [
                    ['min', cd.min || i + 1],
                    ['max', cd.max || i + 1]
                ]);
                if (cd.hidden) {
                    col.setAttribute('hidden', 1);
                }
                if (cd.bestFit) {
                    col.setAttribute('bestFit', 1);
                }
                if (cd.customWidth || cd.width) {
                    col.setAttribute('customWidth', 1);
                }
                if (cd.width) {
                    col.setAttribute('width', cd.width);
                } else {
                    col.setAttribute('width', 9);
                }

                cols.appendChild(col);
            }
        }
        return cols;
    },

    /**
     * Creates the conditional formatting node.
     *
     * @param {XML Doc} doc
     * @param {XML Doc} worksheet
     */
    exportConditionFormat: function(doc, worksheet){
        if(this.conditionFormats.length > 0){
            var ix;
            for(ix = 0; ix < this.conditionFormats.length; ix++){
                var conditionalFormat = this.conditionFormats[ix];
                var conditionalFmt = util.createElement(doc, 'conditionalFormatting', [
                    ['sqref', conditionalFormat.sqref]
                ]);

                var cfRule = util.createElement(doc, 'cfRule', [
                    ['type', conditionalFormat.type],
                    ['priority', conditionalFormat.seq]
                ]);

                var dataBar = util.createElement(doc, 'dataBar');
                dataBar.appendChild(util.createElement(doc, 'cfvo', [
                    ['type', conditionalFormat.rule.type],
                    ['val', conditionalFormat.rule.min]
                ]));
                dataBar.appendChild(util.createElement(doc, 'cfvo', [
                    ['type', conditionalFormat.rule.type],
                    ['val', conditionalFormat.rule.max]
                ]));
                dataBar.appendChild(util.createElement(doc, 'color', [
                    ['rgb', conditionalFormat.rule.color]
                ]));

                var extLst = util.createElement(doc, 'extLst');
                var ext = util.createElement(doc, 'ext', [
                    ['uri', '{B025F937-C7B1-47D3-B67F-A62EFF666E3E}'],
                    ['xmlns:x14', 'http://schemas.microsoft.com/office/spreadsheetml/2009/9/main']
                ]);
                var extId = util.createElement(doc, 'x14:id');
                extId.appendChild(doc.createTextNode('{D39BF35A-12FA-4769-8252-4DC502F2A1BB}'));
                ext.appendChild(extId);
                extLst.appendChild(ext);

                cfRule.appendChild(dataBar);
                cfRule.appendChild(extLst);

                conditionalFmt.appendChild(cfRule);
                worksheet.appendChild(conditionalFmt);
            }
        }
    },

    /**
     * Creates the Future Feature Storage Area node.
     *
     * @param {XML Doc} doc
     * @param {XML Doc} worksheet
     */
    exportExtLst: function(doc, worksheet){
        var extLst = util.createElement(doc, 'extLst');
        var ext = util.createElement(doc, 'ext', [
            ['uri', '{78C0D931-6437-407d-A8EE-F0AAD7539E65}'],
            ['xmlns:x14', 'http://schemas.microsoft.com/office/spreadsheetml/2009/9/main']
        ]);
        var conditionalFmts = util.createElement(doc, 'x14:conditionalFormattings');
        var conditionalFmt = util.createElement(doc, 'x14:conditionalFormatting', [
            ['xmlns:xm', 'http://schemas.microsoft.com/office/excel/2006/main']
        ]);

        var cfRule = util.createElement(doc, 'x14:cfRule', [
            ['type', 'dataBar'],
            ['id', '{D39BF35A-12FA-4769-8252-4DC502F2A1BB}']
        ]);

        var dataBar = util.createElement(doc, 'x14:dataBar', [
            ['minLength', this.conditionFormats[0].rule.min],
            ['maxLength', this.conditionFormats[0].rule.max],
            ['gradient', this.conditionFormats[0].rule.gradient]
        ]);

        var minCfvo = util.createElement(doc, 'x14:cfvo', [
            ['type', this.conditionFormats[0].rule.type]
        ]);
        var minXmf = util.createElement(doc, 'xm:f');
        minXmf.appendChild(doc.createTextNode(this.conditionFormats[0].rule.min));
        minCfvo.appendChild(minXmf);

        var maxCfvo = util.createElement(doc, 'x14:cfvo', [
            ['type', this.conditionFormats[0].rule.type]
        ]);
        var maxXmf = util.createElement(doc, 'xm:f');
        maxXmf.appendChild(doc.createTextNode(this.conditionFormats[0].rule.max));
        maxCfvo.appendChild(maxXmf);


        dataBar.appendChild(minCfvo);
        dataBar.appendChild(maxCfvo);
        dataBar.appendChild(util.createElement(doc, 'x14:negativeFillColor', [
            ['rgb', 'FFFF0000']
        ]));
        dataBar.appendChild(util.createElement(doc, 'x14:axisColor', [
            ['rgb', 'FF000000']
        ]));

        cfRule.appendChild(dataBar);
        conditionalFmt.appendChild(cfRule);
        conditionalFmts.appendChild(conditionalFmt);
        ext.appendChild(conditionalFmts);
        extLst.appendChild(ext);

        worksheet.appendChild(extLst);
    },

    /**
     * Sets the page settings on a worksheet node.
     *
     * @param {XML Doc} doc
     * @param {XML Node} worksheet
     * @returns {undefined}
     */
    exportPageSettings: function (doc, worksheet) {
        worksheet.appendChild(util.createElement(doc, 'printOptions', [
            ['horizontalCentered', '1'],
            ['verticalCentered', '0']
        ]));

        if(this._margin){
            worksheet.appendChild(util.createElement(doc, 'pageMargins', [
                ['left', this._margin.left],
                ['right', this._margin.right],
                ['top', this._margin.top],
                ['bottom', this._margin.bottom],
                ['header', this._margin.header],
                ['footer', this._margin.footer]
            ]));
        }
        else{
            worksheet.appendChild(util.createElement(doc, 'pageMargins', [
                ['left', '0.25'],
                ['right', '0.25'],
                ['top', '0.75'],
                ['bottom', '0.75'],
                ['header', '0.3'],
                ['footer', '0.3']
            ]));
        }

        if(this._orientation) {
            worksheet.appendChild(util.createElement(doc, 'pageSetup', [
                ['orientation', this._orientation],
                ['paperSize', '9']
            ]));
        }
    },

    exportSheetView: function(doc, worksheet){
        var sheetViews = util.createElement(doc, 'sheetViews');
        var sheetView = util.createElement(doc, 'sheetView', [
            ['workbookViewId', '0'],
            ['tabSelected', '0'],
            ['showGridLines', '0']
        ]);
        sheetView.appendChild(util.createElement(doc, 'selection', [
            ['activeCell', 'A1'],
            ['sqref', 'A1']
        ]));

        sheetViews.appendChild(sheetView);
        worksheet.appendChild(sheetViews);
    },

    setConditionalFormatting: function(sqref, desc, type, min, max, color, gradient){
        var tempFormat = {
            sqref : sqref,
            type : desc,
            rule : {
                type : type,
                min : min,
                max : max,
                color : color,
                gradient : gradient
            },
            seq : this.conditionFormats.length + 1
        };

        this.conditionFormats.push(tempFormat);
    },

    setPageMargin: function (margin) {
        this._margin = margin;
    },

    /**
     * http://www.schemacentral.com/sc/ooxml/t-ssml_ST_Orientation.html
     *
     * Can be one of 'portrait' or 'landscape'.
     *
     * @param {String} orientation
     * @returns {undefined}
     */
    setPageOrientation: function (orientation) {
        this._orientation = orientation;
    },

    /**
     * Expects an array of column definitions. Each column definition needs to have a width assigned to it.
     *
     * @param {Array} columns
     */
    setColumns: function (column) {
        this.columns.push(column);
    },

    /**
     * Expects an array of data to be translated into cells.
     *
     * @param {Array} data Two dimensional array - [ [A1, A2], [B1, B2] ]
     * @see <a href='/cookbook/addingDataToAWorksheet.html'>Adding data to a worksheet</a>
     */
    setData: function (data) {
        this.data = data;
    },

    /**
     * Merge cells in given range
     *
     * @param cell1 - A1, A2...
     * @param cell2 - A2, A3...
     */
    mergeCells: function(cell1, cell2) {
        this.mergedCells.push([cell1, cell2]);
    },

    /**
     * Expects an array containing an object full of column format definitions.
     * http://msdn.microsoft.com/en-us/library/documentformat.openxml.spreadsheet.column.aspx
     * bestFit
     * collapsed
     * customWidth
     * hidden
     * max
     * min
     * outlineLevel
     * phonetic
     * style
     * width
     * @param {Array} columnFormats
     */
    setColumnFormats: function (columnFormats) {
        this.columnFormats = columnFormats;
    }
});
