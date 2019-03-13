/**
 * @module Excel/Workbook
 */
function Workbook(config) {
    this.worksheets = [];
    this.tables = [];
    this.drawings = [];
    this.charts = [];
    this.media = {};
    this.initialize(config);
}

_.extend(Workbook.prototype, {

    initialize: function () {
        this.id = _.uniqueId('Workbook');
        this.styleSheet = new StyleSheet();
        this.sharedStrings = new sharedStrings();
        this.relations = new RelationshipManager();
        this.relations.addRelation(this.styleSheet, 'stylesheet');
        this.relations.addRelation(this.sharedStrings, 'sharedStrings');
        this.relations.addRelation({id : 'Theme'}, 'theme');
    },

    createWorksheet: function (config) {
        config = config || {};
        _.defaults(config, {
            name: 'Sheet '.concat(this.worksheets.length + 1)
        });
        return new Worksheet(config);
    },

    getStyleSheet: function () {
        return this.styleSheet;
    },

    addTable: function (table) {
        this.tables.push(table);
    },

    addDrawings: function (drawings) {
        this.drawings.push(drawings);
    },

    addCharts: function (charts) {
        this.charts.push(charts);
    },

    addMedia: function (type, fileName, fileData, contentType) {
        var fileNamePieces = fileName.split('.');
        var extension = fileNamePieces[fileNamePieces.length - 1];
        if(!contentType) {
            switch(extension.toLowerCase()) {
                case 'jpeg':
                case 'jpg':
                    contentType = "image/jpeg";
                    break;
                case 'png':
                    contentType = "image/png";
                    break;
                case 'gif':
                    contentType = "image/gif";
                    break;
                default:
                    contentType = null;
                    break;
            }
        }
        if(!this.media[fileName]) {
            this.media[fileName] = {
                id: fileName,
                data: fileData,
                fileName: fileName,
                contentType: contentType,
                extension: extension
            };
        }
        return this.media[fileName];
    },

    addWorksheet: function (worksheet) {
        this.relations.addRelation(worksheet, 'worksheet');
        worksheet.setSharedStringCollection(this.sharedStrings);
        this.worksheets.push(worksheet);
    },

    createContentTypes: function () {
        var doc = util.createXmlDoc(util.schemas.contentTypes, 'Types');
        var types = doc.documentElement;
        var i, l;

        types.appendChild(util.createElement(doc, 'Default', [
            ['Extension', "rels"],
            ['ContentType', "application/vnd.openxmlformats-package.relationships+xml"]
        ]));
        types.appendChild(util.createElement(doc, 'Default', [
            ['Extension', "xml"],
            ['ContentType', "application/xml"]
        ]));

        var extensions = {};
        for(var filename in this.media) {
            if(this.media.hasOwnProperty(filename)) {
                extensions[this.media[filename].extension] = this.media[filename].contentType;
            }
        }
        for(var extension in extensions) {
            if(extensions.hasOwnProperty(extension)) {
                types.appendChild(util.createElement(doc, 'Default', [
                    ['Extension', extension],
                    ['ContentType', extensions[extension]]
                ]));
            }
        }

        types.appendChild(util.createElement(doc, 'Override', [
            ['PartName', "/xl/workbook.xml"],
            ['ContentType', "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"]
        ]));
        types.appendChild(util.createElement(doc, 'Override', [
            ['PartName', "/xl/sharedStrings.xml"],
            ['ContentType', "application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"]
        ]));
        types.appendChild(util.createElement(doc, 'Override', [
            ['PartName', "/xl/styles.xml"],
            ['ContentType', "application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"]
        ]));
        types.appendChild(util.createElement(doc, 'Override', [
            ['PartName', "/xl/theme/theme1.xml"],
            ['ContentType', "application/vnd.openxmlformats-officedocument.theme+xml"]
        ]));

        for(i = 0, l = this.worksheets.length; i < l; i++) {
            types.appendChild(util.createElement(doc, 'Override', [
                ['PartName', "/xl/worksheets/sheet" + (i + 1) + ".xml"],
                ['ContentType', "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"]
            ]));
        }
        for(i = 0, l = this.tables.length; i < l; i++) {
            types.appendChild(util.createElement(doc, 'Override', [
                ['PartName', "/xl/tables/table" + (i + 1) + ".xml"],
                ['ContentType', "application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml"]
            ]));
        }

        for(i = 0, l = this.drawings.length; i < l; i++) {
            types.appendChild(util.createElement(doc, 'Override', [
                ['PartName', '/xl/drawings/drawing' + (i + 1) + '.xml'],
                ['ContentType', 'application/vnd.openxmlformats-officedocument.drawing+xml']
            ]));
        }

        for(i = 0, l = this.charts.length; i < l; i++) {
            types.appendChild(util.createElement(doc, 'Override', [
                ['PartName', '/xl/charts/chart' + (i + 1) + '.xml'],
                ['ContentType', 'application/vnd.openxmlformats-officedocument.drawingml.chart+xml']
            ]));
            types.appendChild(util.createElement(doc, 'Override', [
                ['PartName', '/xl/charts/style' + (i + 1) + '.xml'],
                ['ContentType', 'application/vnd.ms-office.chartstyle+xml']
            ]));
            types.appendChild(util.createElement(doc, 'Override', [
                ['PartName', '/xl/charts/colors' + (i + 1) + '.xml'],
                ['ContentType', 'application/vnd.ms-office.chartcolorstyle+xml']
            ]));
        }

        return doc;
    },

    exportBookViews: function(doc, workbook){
        var bookViews = util.createElement(doc, 'bookViews');
        bookViews.appendChild(util.createElement(doc, 'workbookView', [
            ['visibility', 'visible'],
            ['activeTab', '0']
        ]));

        workbook.appendChild(bookViews);
    },

    toXML: function () {
        var doc = util.createXmlDoc(util.schemas.spreadsheetml, 'workbook');
        var wb = doc.documentElement;
        wb.setAttribute('xmlns:r', util.schemas.relationships);

        this.exportBookViews(doc, wb);

        var maxWorksheetNameLength = 31;
        var sheets = util.createElement(doc, 'sheets');
        for(var i = 0, l = this.worksheets.length; i < l; i++) {
            var sheet = doc.createElement('sheet');
            // Microsoft Excel (2007, 2013) do not allow worksheet names longer than 31 characters
            // if the worksheet name is longer, Excel displays an "Excel found unreadable content..." popup when opening the file
            if(console != null && this.worksheets[i].name.length > maxWorksheetNameLength) {
                console.log('Microsoft Excel requires work sheet names to be less than ' + (maxWorksheetNameLength+1) +
                        ' characters long, work sheet name "' + this.worksheets[i].name +
                        '" is ' + this.worksheets[i].name.length + ' characters long');
            }
            sheet.setAttribute('name', this.worksheets[i].name);
            sheet.setAttribute('sheetId', i + 1);
            if(this.worksheets[i].state){
                sheet.setAttribute('state', this.worksheets[i].state);
            }
            sheet.setAttribute('r:id', this.relations.getRelationshipId(this.worksheets[i]));
            sheets.appendChild(sheet);
        }
        wb.appendChild(sheets);
        return doc;
    },

    createWorkbookRelationship: function () {
        var doc = util.createXmlDoc(util.schemas.relationshipPackage, 'Relationships');
        var relationships = doc.documentElement;
        relationships.appendChild(util.createElement(doc, 'Relationship', [
            ['Id', 'rId1'],
            ['Type', util.schemas.officeDocument],
            ['Target', 'xl/workbook.xml']
            ]));
        return doc;
    },

    _generateCorePaths: function (files) {
        var i, l;
        Paths[this.styleSheet.id] = 'styles.xml';
        Paths[this.sharedStrings.id] = 'sharedStrings.xml';
        Paths[this.id] = '/xl/workbook.xml';

        for(i = 0, l = this.tables.length; i < l; i++) {
            files['/xl/tables/table' + (i + 1) + '.xml'] = this.tables[i].toXML();
            Paths[this.tables[i].id] = '/xl/tables/table' + (i + 1) + '.xml';
        }

        for(var fileName in this.media) {
            if(this.media.hasOwnProperty(fileName)) {
                var media = this.media[fileName];
                files['/xl/media/' + fileName] = media.data;
                Paths[fileName] = '/xl/media/' + fileName;
            }
        }

        for(i = 0, l = this.charts.length; i < l; i++) {
            files['/xl/charts/chart' + (i + 1) + '.xml'] = this.charts[i].toXML();
            Paths[this.charts[i].id] = '/xl/charts/chart' + (i + 1) + '.xml';

        }

        for(i = 0, l = this.drawings.length; i < l; i++) {
            files['/xl/drawings/drawing' + (i + 1) + '.xml'] = this.drawings[i].toXML();
            Paths[this.drawings[i].id] = '/xl/drawings/drawing' + (i + 1) + '.xml';
            files['/xl/drawings/_rels/drawing' + (i + 1) + '.xml.rels'] = this.drawings[i].relations.toXML();
        }

        Paths['Theme'] = 'theme/theme1.xml';
    },

    _prepareFilesForPackaging: function (files) {

        _.extend(files, {
            '/[Content_Types].xml': this.createContentTypes(),
            '/_rels/.rels': this.createWorkbookRelationship(),
            '/xl/styles.xml': this.styleSheet.toXML(),
            '/xl/workbook.xml': this.toXML(),
            '/xl/sharedStrings.xml': this.sharedStrings.toXML(),
            '/xl/_rels/workbook.xml.rels': this.relations.toXML()
        });

        _.each(files, function (value, key) {
            if(key.indexOf('.xml') !== -1 || key.indexOf('.rels') !== -1) {
                if (value instanceof XMLDOM){
                    files[key] = value.toString();
                } else {
                    files[key] = value.xml || new window.XMLSerializer().serializeToString(value);
                }
                var content = files[key].replace(/xmlns=""/g, '');
                content = content.replace(/NS[\d]+:/g, '');
                content = content.replace(/xmlns:NS[\d]+=""/g, '');
                files[key] = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + "\n" + content;
            }
        });

        files['/xl/theme/theme1.xml'] = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + "\n" +'<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office 테마"><a:themeElements><a:clrScheme name="Office"><a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1><a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="44546A"/></a:dk2><a:lt2><a:srgbClr val="E7E6E6"/></a:lt2><a:accent1><a:srgbClr val="5B9BD5"/></a:accent1><a:accent2><a:srgbClr val="ED7D31"/></a:accent2><a:accent3><a:srgbClr val="A5A5A5"/></a:accent3><a:accent4><a:srgbClr val="FFC000"/></a:accent4><a:accent5><a:srgbClr val="4472C4"/></a:accent5><a:accent6><a:srgbClr val="70AD47"/></a:accent6><a:hlink><a:srgbClr val="0563C1"/></a:hlink><a:folHlink><a:srgbClr val="954F72"/></a:folHlink></a:clrScheme><a:fontScheme name="Office"><a:majorFont><a:latin typeface="Calibri Light" panose="020F0302020204030204"/><a:ea typeface=""/><a:cs typeface=""/><a:font script="Jpan" typeface="ＭＳ Ｐゴシック"/><a:font script="Hang" typeface="맑은 고딕"/><a:font script="Hant" typeface="新細明體"/><a:font script="Arab" typeface="Times New Roman"/><a:font script="Hebr" typeface="Times New Roman"/><a:font script="Thai" typeface="Tahoma"/><a:font script="Ethi" typeface="Nyala"/><a:font script="Beng" typeface="Vrinda"/><a:font script="Gujr" typeface="Shruti"/><a:font script="Khmr" typeface="MoolBoran"/><a:font script="Knda" typeface="Tunga"/><a:font script="Guru" typeface="Raavi"/><a:font script="Cans" typeface="Euphemia"/><a:font script="Cher" typeface="Plantagenet Cherokee"/><a:font script="Yiii" typeface="Microsoft Yi Baiti"/><a:font script="Tibt" typeface="Microsoft Himalaya"/><a:font script="Thaa" typeface="MV Boli"/><a:font script="Deva" typeface="Mangal"/><a:font script="Telu" typeface="Gautami"/><a:font script="Taml" typeface="Latha"/><a:font script="Syrc" typeface="Estrangelo Edessa"/><a:font script="Orya" typeface="Kalinga"/><a:font script="Mlym" typeface="Kartika"/><a:font script="Laoo" typeface="DokChampa"/><a:font script="Sinh" typeface="Iskoola Pota"/><a:font script="Mong" typeface="Mongolian Baiti"/><a:font script="Viet" typeface="Times New Roman"/><a:font script="Uigh" typeface="Microsoft Uighur"/><a:font script="Geor" typeface="Sylfaen"/></a:majorFont><a:minorFont><a:latin typeface="Calibri" panose="020F0502020204030204"/><a:ea typeface=""/><a:cs typeface=""/><a:font script="Jpan" typeface="ＭＳ Ｐゴシック"/><a:font script="Hang" typeface="맑은 고딕"/><a:font script="Hant" typeface="新細明體"/><a:font script="Arab" typeface="Arial"/><a:font script="Hebr" typeface="Arial"/><a:font script="Thai" typeface="Tahoma"/><a:font script="Ethi" typeface="Nyala"/><a:font script="Beng" typeface="Vrinda"/><a:font script="Gujr" typeface="Shruti"/><a:font script="Khmr" typeface="DaunPenh"/><a:font script="Knda" typeface="Tunga"/><a:font script="Guru" typeface="Raavi"/><a:font script="Cans" typeface="Euphemia"/><a:font script="Cher" typeface="Plantagenet Cherokee"/><a:font script="Yiii" typeface="Microsoft Yi Baiti"/><a:font script="Tibt" typeface="Microsoft Himalaya"/><a:font script="Thaa" typeface="MV Boli"/><a:font script="Deva" typeface="Mangal"/><a:font script="Telu" typeface="Gautami"/><a:font script="Taml" typeface="Latha"/><a:font script="Syrc" typeface="Estrangelo Edessa"/><a:font script="Orya" typeface="Kalinga"/><a:font script="Mlym" typeface="Kartika"/><a:font script="Laoo" typeface="DokChampa"/><a:font script="Sinh" typeface="Iskoola Pota"/><a:font script="Mong" typeface="Mongolian Baiti"/><a:font script="Viet" typeface="Arial"/><a:font script="Uigh" typeface="Microsoft Uighur"/><a:font script="Geor" typeface="Sylfaen"/></a:minorFont></a:fontScheme><a:fmtScheme name="Office"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:lumMod val="110000"/><a:satMod val="105000"/><a:tint val="67000"/></a:schemeClr></a:gs><a:gs pos="50000"><a:schemeClr val="phClr"><a:lumMod val="105000"/><a:satMod val="103000"/><a:tint val="73000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:lumMod val="105000"/><a:satMod val="109000"/><a:tint val="81000"/></a:schemeClr></a:gs></a:gsLst><a:lin ang="5400000" scaled="0"/></a:gradFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:satMod val="103000"/><a:lumMod val="102000"/><a:tint val="94000"/></a:schemeClr></a:gs><a:gs pos="50000"><a:schemeClr val="phClr"><a:satMod val="110000"/><a:lumMod val="100000"/><a:shade val="100000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:lumMod val="99000"/><a:satMod val="120000"/><a:shade val="78000"/></a:schemeClr></a:gs></a:gsLst><a:lin ang="5400000" scaled="0"/></a:gradFill></a:fillStyleLst><a:lnStyleLst><a:ln w="6350" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/><a:miter lim="800000"/></a:ln><a:ln w="12700" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/><a:miter lim="800000"/></a:ln><a:ln w="19050" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/><a:miter lim="800000"/></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst><a:outerShdw blurRad="57150" dist="19050" dir="5400000" algn="ctr" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="63000"/></a:srgbClr></a:outerShdw></a:effectLst></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"><a:tint val="95000"/><a:satMod val="170000"/></a:schemeClr></a:solidFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="93000"/><a:satMod val="150000"/><a:shade val="98000"/><a:lumMod val="102000"/></a:schemeClr></a:gs><a:gs pos="50000"><a:schemeClr val="phClr"><a:tint val="98000"/><a:satMod val="130000"/><a:shade val="90000"/><a:lumMod val="103000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:shade val="63000"/><a:satMod val="120000"/></a:schemeClr></a:gs></a:gsLst><a:lin ang="5400000" scaled="0"/></a:gradFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements><a:objectDefaults/><a:extraClrSchemeLst/><a:extLst><a:ext uri="{05A4C25C-085E-4340-85A3-A5531E510DB2}"><thm15:themeFamily xmlns:thm15="http://schemas.microsoft.com/office/thememl/2012/main" name="Office Theme" id="{62F939B6-93AF-4DB8-9C6B-D6C7DFDC589F}" vid="{4A3C46E8-61CC-4603-A589-7422A47A8E4A}"/></a:ext></a:extLst></a:theme>';
        files['/xl/charts/_rels/chart1.xml.rels'] = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + "\n" +'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId40" Type="http://schemas.microsoft.com/office/2011/relationships/chartColorStyle" Target="/xl/charts/colors1.xml"/><Relationship Id="rId41" Type="http://schemas.microsoft.com/office/2011/relationships/chartStyle" Target="/xl/charts/style1.xml"/></Relationships>';
        files['/xl/charts/style1.xml'] = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + "\n" +'<cs:chartStyle xmlns:cs="http://schemas.microsoft.com/office/drawing/2012/chartStyle" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" id="332"><cs:axisTitle><cs:lnRef idx="0"/><cs:fillRef idx="0"/><cs:effectRef idx="0"/><cs:fontRef idx="minor"><a:schemeClr val="tx1"><a:lumMod val="65000"/><a:lumOff val="35000"/></a:schemeClr></cs:fontRef><cs:defRPr sz="1000" kern="1200"/></cs:axisTitle><cs:categoryAxis><cs:lnRef idx="0"/><cs:fillRef idx="0"/><cs:effectRef idx="0"/><cs:fontRef idx="minor"><a:schemeClr val="tx1"><a:lumMod val="65000"/><a:lumOff val="35000"/></a:schemeClr></cs:fontRef><cs:spPr><a:ln w="9525" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="tx1"><a:lumMod val="15000"/><a:lumOff val="85000"/></a:schemeClr></a:solidFill><a:round/></a:ln></cs:spPr><cs:defRPr sz="900" kern="1200"/></cs:categoryAxis><cs:chartArea mods="allowNoFillOverride allowNoLineOverride"><cs:lnRef idx="0"/><cs:fillRef idx="0"/><cs:effectRef idx="0"/><cs:fontRef idx="minor"><a:schemeClr val="tx1"/></cs:fontRef><cs:spPr><a:solidFill><a:schemeClr val="bg1"/></a:solidFill><a:ln w="9525" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="tx1"><a:lumMod val="15000"/><a:lumOff val="85000"/></a:schemeClr></a:solidFill><a:round/></a:ln></cs:spPr><cs:defRPr sz="1000" kern="1200"/></cs:chartArea><cs:dataLabel><cs:lnRef idx="0"/><cs:fillRef idx="0"/><cs:effectRef idx="0"/><cs:fontRef idx="minor"><a:schemeClr val="tx1"><a:lumMod val="75000"/><a:lumOff val="25000"/></a:schemeClr></cs:fontRef><cs:defRPr sz="900" kern="1200"/></cs:dataLabel><cs:dataLabelCallout><cs:lnRef idx="0"/><cs:fillRef idx="0"/><cs:effectRef idx="0"/><cs:fontRef idx="minor"><a:schemeClr val="dk1"><a:lumMod val="65000"/><a:lumOff val="35000"/></a:schemeClr></cs:fontRef><cs:spPr><a:solidFill><a:schemeClr val="lt1"/></a:solidFill><a:ln><a:solidFill><a:schemeClr val="dk1"><a:lumMod val="25000"/><a:lumOff val="75000"/></a:schemeClr></a:solidFill></a:ln></cs:spPr><cs:defRPr sz="900" kern="1200"/><cs:bodyPr rot="0" spcFirstLastPara="1" vertOverflow="clip" horzOverflow="clip" vert="horz" wrap="square" lIns="36576" tIns="18288" rIns="36576" bIns="18288" anchor="ctr" anchorCtr="1"><a:spAutoFit/></cs:bodyPr></cs:dataLabelCallout><cs:dataPoint><cs:lnRef idx="0"/><cs:fillRef idx="1"><cs:styleClr val="auto"/></cs:fillRef><cs:effectRef idx="0"/><cs:fontRef idx="minor"><a:schemeClr val="tx1"/></cs:fontRef></cs:dataPoint><cs:dataPoint3D><cs:lnRef idx="0"/><cs:fillRef idx="1"><cs:styleClr val="auto"/></cs:fillRef><cs:effectRef idx="0"/><cs:fontRef idx="minor"><a:schemeClr val="tx1"/></cs:fontRef></cs:dataPoint3D><cs:dataPointLine><cs:lnRef idx="0"><cs:styleClr val="auto"/></cs:lnRef><cs:fillRef idx="1"/><cs:effectRef idx="0"/><cs:fontRef idx="minor"><a:schemeClr val="tx1"/></cs:fontRef><cs:spPr><a:ln w="28575" cap="rnd"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:round/></a:ln></cs:spPr></cs:dataPointLine><cs:dataPointMarker><cs:lnRef idx="0"><cs:styleClr val="auto"/></cs:lnRef><cs:fillRef idx="1"><cs:styleClr val="auto"/></cs:fillRef><cs:effectRef idx="0"/><cs:fontRef idx="minor"><a:schemeClr val="tx1"/></cs:fontRef><cs:spPr><a:ln w="9525"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></cs:spPr></cs:dataPointMarker><cs:dataPointMarkerLayout symbol="circle" size="5"/><cs:dataPointWireframe><cs:lnRef idx="0"><cs:styleClr val="auto"/></cs:lnRef><cs:fillRef idx="1"/><cs:effectRef idx="0"/><cs:fontRef idx="minor"><a:schemeClr val="tx1"/></cs:fontRef><cs:spPr><a:ln w="9525" cap="rnd"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:round/></a:ln></cs:spPr></cs:dataPointWireframe><cs:dataTable><cs:lnRef idx="0"/><cs:fillRef idx="0"/><cs:effectRef idx="0"/><cs:fontRef idx="minor"><a:schemeClr val="tx1"><a:lumMod val="65000"/><a:lumOff val="35000"/></a:schemeClr></cs:fontRef><cs:spPr><a:noFill/><a:ln w="9525" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="tx1"><a:lumMod val="15000"/><a:lumOff val="85000"/></a:schemeClr></a:solidFill><a:round/></a:ln></cs:spPr><cs:defRPr sz="900" kern="1200"/></cs:dataTable><cs:downBar><cs:lnRef idx="0"/><cs:fillRef idx="0"/><cs:effectRef idx="0"/><cs:fontRef idx="minor"><a:schemeClr val="dk1"/></cs:fontRef><cs:spPr><a:solidFill><a:schemeClr val="dk1"><a:lumMod val="65000"/><a:lumOff val="35000"/></a:schemeClr></a:solidFill><a:ln w="9525"><a:solidFill><a:schemeClr val="tx1"><a:lumMod val="65000"/><a:lumOff val="35000"/></a:schemeClr></a:solidFill></a:ln></cs:spPr></cs:downBar><cs:dropLine><cs:lnRef idx="0"/><cs:fillRef idx="0"/><cs:effectRef idx="0"/><cs:fontRef idx="minor"><a:schemeClr val="tx1"/></cs:fontRef><cs:spPr><a:ln w="9525" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="tx1"><a:lumMod val="35000"/><a:lumOff val="65000"/></a:schemeClr></a:solidFill><a:round/></a:ln></cs:spPr></cs:dropLine><cs:errorBar><cs:lnRef idx="0"/><cs:fillRef idx="0"/><cs:effectRef idx="0"/><cs:fontRef idx="minor"><a:schemeClr val="tx1"/></cs:fontRef><cs:spPr><a:ln w="9525" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="tx1"><a:lumMod val="65000"/><a:lumOff val="35000"/></a:schemeClr></a:solidFill><a:round/></a:ln></cs:spPr></cs:errorBar><cs:floor><cs:lnRef idx="0"/><cs:fillRef idx="0"/><cs:effectRef idx="0"/><cs:fontRef idx="minor"><a:schemeClr val="tx1"/></cs:fontRef><cs:spPr><a:noFill/><a:ln><a:noFill/></a:ln></cs:spPr></cs:floor><cs:gridlineMajor><cs:lnRef idx="0"/><cs:fillRef idx="0"/><cs:effectRef idx="0"/><cs:fontRef idx="minor"><a:schemeClr val="tx1"/></cs:fontRef><cs:spPr><a:ln w="9525" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="tx1"><a:lumMod val="15000"/><a:lumOff val="85000"/></a:schemeClr></a:solidFill><a:round/></a:ln></cs:spPr></cs:gridlineMajor><cs:gridlineMinor><cs:lnRef idx="0"/><cs:fillRef idx="0"/><cs:effectRef idx="0"/><cs:fontRef idx="minor"><a:schemeClr val="tx1"/></cs:fontRef><cs:spPr><a:ln w="9525" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="tx1"><a:lumMod val="5000"/><a:lumOff val="95000"/></a:schemeClr></a:solidFill><a:round/></a:ln></cs:spPr></cs:gridlineMinor><cs:hiLoLine><cs:lnRef idx="0"/><cs:fillRef idx="0"/><cs:effectRef idx="0"/><cs:fontRef idx="minor"><a:schemeClr val="tx1"/></cs:fontRef><cs:spPr><a:ln w="9525" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="tx1"><a:lumMod val="75000"/><a:lumOff val="25000"/></a:schemeClr></a:solidFill><a:round/></a:ln></cs:spPr></cs:hiLoLine><cs:leaderLine><cs:lnRef idx="0"/><cs:fillRef idx="0"/><cs:effectRef idx="0"/><cs:fontRef idx="minor"><a:schemeClr val="tx1"/></cs:fontRef><cs:spPr><a:ln w="9525" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="tx1"><a:lumMod val="35000"/><a:lumOff val="65000"/></a:schemeClr></a:solidFill><a:round/></a:ln></cs:spPr></cs:leaderLine><cs:legend><cs:lnRef idx="0"/><cs:fillRef idx="0"/><cs:effectRef idx="0"/><cs:fontRef idx="minor"><a:schemeClr val="tx1"><a:lumMod val="65000"/><a:lumOff val="35000"/></a:schemeClr></cs:fontRef><cs:defRPr sz="900" kern="1200"/></cs:legend><cs:plotArea mods="allowNoFillOverride allowNoLineOverride"><cs:lnRef idx="0"/><cs:fillRef idx="0"/><cs:effectRef idx="0"/><cs:fontRef idx="minor"><a:schemeClr val="tx1"/></cs:fontRef></cs:plotArea><cs:plotArea3D mods="allowNoFillOverride allowNoLineOverride"><cs:lnRef idx="0"/><cs:fillRef idx="0"/><cs:effectRef idx="0"/><cs:fontRef idx="minor"><a:schemeClr val="tx1"/></cs:fontRef></cs:plotArea3D><cs:seriesAxis><cs:lnRef idx="0"/><cs:fillRef idx="0"/><cs:effectRef idx="0"/><cs:fontRef idx="minor"><a:schemeClr val="tx1"><a:lumMod val="65000"/><a:lumOff val="35000"/></a:schemeClr></cs:fontRef><cs:defRPr sz="900" kern="1200"/></cs:seriesAxis><cs:seriesLine><cs:lnRef idx="0"/><cs:fillRef idx="0"/><cs:effectRef idx="0"/><cs:fontRef idx="minor"><a:schemeClr val="tx1"/></cs:fontRef><cs:spPr><a:ln w="9525" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="tx1"><a:lumMod val="35000"/><a:lumOff val="65000"/></a:schemeClr></a:solidFill><a:round/></a:ln></cs:spPr></cs:seriesLine><cs:title><cs:lnRef idx="0"/><cs:fillRef idx="0"/><cs:effectRef idx="0"/><cs:fontRef idx="minor"><a:schemeClr val="tx1"><a:lumMod val="65000"/><a:lumOff val="35000"/></a:schemeClr></cs:fontRef><cs:defRPr sz="1400" b="0" kern="1200" spc="0" baseline="0"/></cs:title><cs:trendline><cs:lnRef idx="0"><cs:styleClr val="auto"/></cs:lnRef><cs:fillRef idx="0"/><cs:effectRef idx="0"/><cs:fontRef idx="minor"><a:schemeClr val="tx1"/></cs:fontRef><cs:spPr><a:ln w="19050" cap="rnd"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="sysDot"/></a:ln></cs:spPr></cs:trendline><cs:trendlineLabel><cs:lnRef idx="0"/><cs:fillRef idx="0"/><cs:effectRef idx="0"/><cs:fontRef idx="minor"><a:schemeClr val="tx1"><a:lumMod val="65000"/><a:lumOff val="35000"/></a:schemeClr></cs:fontRef><cs:defRPr sz="900" kern="1200"/></cs:trendlineLabel><cs:upBar><cs:lnRef idx="0"/><cs:fillRef idx="0"/><cs:effectRef idx="0"/><cs:fontRef idx="minor"><a:schemeClr val="dk1"/></cs:fontRef><cs:spPr><a:solidFill><a:schemeClr val="lt1"/></a:solidFill><a:ln w="9525"><a:solidFill><a:schemeClr val="tx1"><a:lumMod val="15000"/><a:lumOff val="85000"/></a:schemeClr></a:solidFill></a:ln></cs:spPr></cs:upBar><cs:valueAxis><cs:lnRef idx="0"/><cs:fillRef idx="0"/><cs:effectRef idx="0"/><cs:fontRef idx="minor"><a:schemeClr val="tx1"><a:lumMod val="65000"/><a:lumOff val="35000"/></a:schemeClr></cs:fontRef><cs:defRPr sz="900" kern="1200"/></cs:valueAxis><cs:wall><cs:lnRef idx="0"/><cs:fillRef idx="0"/><cs:effectRef idx="0"/><cs:fontRef idx="minor"><a:schemeClr val="tx1"/></cs:fontRef><cs:spPr><a:noFill/><a:ln><a:noFill/></a:ln></cs:spPr></cs:wall></cs:chartStyle>';
        files['/xl/charts/colors1.xml'] = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + "\n" +'<cs:colorStyle xmlns:cs="http://schemas.microsoft.com/office/drawing/2012/chartStyle" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" meth="cycle" id="10"><a:schemeClr val="accent1"/><a:schemeClr val="accent2"/><a:schemeClr val="accent3"/><a:schemeClr val="accent4"/><a:schemeClr val="accent5"/><a:schemeClr val="accent6"/><cs:variation/><cs:variation><a:lumMod val="60000"/></cs:variation><cs:variation><a:lumMod val="80000"/><a:lumOff val="20000"/></cs:variation><cs:variation><a:lumMod val="80000"/></cs:variation><cs:variation><a:lumMod val="60000"/><a:lumOff val="40000"/></cs:variation><cs:variation><a:lumMod val="50000"/></cs:variation><cs:variation><a:lumMod val="70000"/><a:lumOff val="30000"/></cs:variation><cs:variation><a:lumMod val="70000"/></cs:variation><cs:variation><a:lumMod val="50000"/><a:lumOff val="50000"/></cs:variation></cs:colorStyle>';
    },

    generateFilesAsync: function (options) {
        var requireJsPath = options.requireJsPath;
        var self = this;
        if(!options.requireJsPath) {
            requireJsPath = document.getElementById('requirejs') ? document.getElementById('requirejs').src : '';
        }
        if(!requireJsPath) {
            throw "Please add 'requirejs' to the script that includes requirejs, or specify the path as an argument";
        }
        var files = {},
            doneCount = this.worksheets.length,
            stringsCollectedCount = this.worksheets.length,
            workers = [];

        var result = {
            status: "Not Started",
            terminate: function () {
                for(var i = 0; i < workers.length; i++) {
                    workers[i].terminate();
                }
            }
        };
        this._generateCorePaths(files);

        var done = function () {
            if(--doneCount === 0) {
                self._prepareFilesForPackaging(files);
                for(var i = 0; i < workers.length; i++) {
                    workers[i].terminate();
                }
                options.success(files);
            }
        };
        var stringsCollected = function () {
            if(--stringsCollectedCount === 0) {
                for(var i = 0; i < workers.length; i++) {
                    workers[i].postMessage({
                        instruction: 'export',
                        sharedStrings: self.sharedStrings.exportData()
                    });
                }
            }
        };


        var worksheetWorker = function (worksheetIndex) {
            return {
                error: function () {
                    for(var i = 0; i < workers.length; i++) {
                        workers[i].terminate();
                    }
                    //message, filename, lineno
                    options.error.apply(this, arguments);
                },
                stringsCollected: function () {
                    stringsCollected();
                },
                finished: function (data) {
                    files['/xl/worksheets/sheet' + (worksheetIndex + 1) + '.xml'] = {xml: data};
                    Paths[self.worksheets[worksheetIndex].id] = 'worksheets/sheet' + (worksheetIndex + 1) + '.xml';
                    files['/xl/worksheets/_rels/sheet' + (worksheetIndex + 1) + '.xml.rels'] = self.worksheets[worksheetIndex].relations.toXML();
                    done();
                }
            };
        };

        for(var i = 0, l = this.worksheets.length; i < l; i++) {
            workers.push(
                this._createWorker(requireJsPath, i, worksheetWorker(i))
            );
        }

        return result;
    },

    _createWorker: function (requireJsPath, worksheetIndex, callbacks) {
        var worker = new window.Worker(require.toUrl('./WorksheetExportWorker.js'));
        var self = this;
        worker.addEventListener('error', callbacks.error);
        worker.addEventListener('message', function(event) {
//                console.log("Called back by the worker!\n", event.data);
            switch(event.data.status) {
                case "ready":
                    worker.postMessage({
                        instruction: 'start',
                        data: self.worksheets[worksheetIndex].exportData()
                    });
                    break;
                case "sharedStrings":
                    for(var i = 0; i < event.data.data.length; i++) {
                        self.sharedStrings.addString(event.data.data[i]);
                    }
                    callbacks.stringsCollected();
                    break;
                case "finished":
                    callbacks.finished(event.data.data);
                    break;
            }
        }, false);
        worker.postMessage({
            instruction: 'setup',
            config: {
                paths: {
                    underscore: require.toUrl('underscore').slice(0, -3)
                },
                shim: {
                    'underscore': {
                        exports: '_'
                    }
                }
            },
            requireJsPath: requireJsPath
        });
        return worker;
    },

    generateFiles: function () {
        var files = {};
        this._generateCorePaths(files);

        for(var i = 0, l = this.worksheets.length; i < l; i++) {
            files['/xl/worksheets/sheet' + (i + 1) + '.xml'] = this.worksheets[i].toXML();
            Paths[this.worksheets[i].id] = 'worksheets/sheet' + (i + 1) + '.xml';
            files['/xl/worksheets/_rels/sheet' + (i + 1) + '.xml.rels'] = this.worksheets[i].relations.toXML();
        }

        this._prepareFilesForPackaging(files);

        return files;
    }
});