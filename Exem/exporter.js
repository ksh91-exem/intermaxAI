var Base64 = (function() {
    // Private property
    var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    // Private method for UTF-8 encoding

    function utf8Encode(string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    }

    // Public method for encoding
    return {
        encode: (typeof btoa == 'function') ? function(input) {
            return btoa(utf8Encode(input));
        } : function(input) {
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;
            input = utf8Encode(input);
            while (i < input.length) {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
                output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
            }
            return output;
        }
    };
})();

Ext.override(Ext.grid.GridPanel, {


    /*
     Kick off process
     */

    downloadExcelXml: function(includeHidden, title) {

        //var loopCount  = Math.ceil(this.exportStore.proxy.data.length/500);
        var loopCount  = Math.ceil(this.exportStore.data.items.length/500);
        var startIndex = 0;
        var endIndex   = 500;
        var vExportContent = '' ;
        var location = '' ;
        var endFlag = false ;
        var idx = 0 ;
        var worksheet = '' ;

        for(var ix = 0; ix < loopCount; ix++) {

            if ( idx == loopCount-1 ) {
                endFlag = true ;
            }
            worksheet = this.createWorksheet(includeHidden, title,  startIndex, endIndex, endFlag);


            startIndex = endIndex;
            endIndex   += 500;
            idx += 1;

        } ;

        vExportContent = this.getExcelXml( title, worksheet ) ;
        location = 'data:application/vnd.ms-excel;base64,' + Base64.encode(vExportContent);

        if (!title) {
            title = this.title;
        }

        var gridEl = this.getEl();

        var el = Ext.DomHelper.append(gridEl, {
            tag: "a",
            download: title + "-" + Ext.Date.format(new Date(), 'Y-m-d Hi')+ '_'+(ix+1) + '.xls',
            href: location
        });

        el.click();
        Ext.fly(el).destroy();

        this.exportStore.loadData([], false);
        this.exportStore.load();
    },


    /*

     Welcome to XML Hell
     See: http://msdn.microsoft.com/en-us/library/office/aa140066(v=office.10).aspx
     for more details

     */
    getExcelXml: function(title, worksheet) {

        var theTitle = title || this.title;

        //var worksheet = this.createWorksheet(includeHidden, theTitle,  startIndex, endIndex, endFlag);
        //var totalWidth = this.columns.length;

        return ''.concat('<?xml version="1.0"?>', '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40">', '<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office"><Title>' + theTitle + '</Title></DocumentProperties>', '<OfficeDocumentSettings xmlns="urn:schemas-microsoft-com:office:office"><AllowPNG/></OfficeDocumentSettings>', '<ExcelWorkbook xmlns="urn:schemas-microsoft-com:office:excel">', '<WindowHeight>' + worksheet.height + '</WindowHeight>', '<ss:WindowWidth>' + worksheet.width + '</ss:WindowWidth >', '<ProtectStructure>False</ProtectStructure>', '<ProtectWindows>False</ProtectWindows>', '</ExcelWorkbook>',

                '<Styles>',

                '<Style ss:ID="Default" ss:Name="Normal">', '<Alignment ss:Vertical="Bottom"/>', '<Borders/>', '<Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="12" ss:Color="#000000"/>', '<Interior/>', '<NumberFormat/>', '<Protection/>', '</Style>',

                '<Style ss:ID="title">', '<Borders />', '<Font ss:Bold="1" ss:Size="18" />', '<Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1" />', '<NumberFormat ss:Format="@" />', '</Style>',

                '<Style ss:ID="headercell">', '<Font ss:Bold="1" ss:Size="10" />', '<Alignment ss:Horizontal="Center" ss:WrapText="1" />', '<Interior ss:Color="#E7E7E9" ss:Pattern="Solid" />', '</Style>',


                '<Style ss:ID="even">', '<Interior ss:Color="#FFFFFF" ss:Pattern="Solid" />', '</Style>',


                '<Style ss:ID="evendate" ss:Parent="even">', '<NumberFormat ss:Format="yyyy-mm-dd" />', '</Style>',


                '<Style ss:ID="evenint" ss:Parent="even">', '<Numberformat ss:Format="0" />', '</Style>',

                '<Style ss:ID="evenfloat" ss:Parent="even">', '<Numberformat ss:Format="0.00" />', '</Style>',

                '<Style ss:ID="odd">', '<Interior ss:Color="#FAFAFA" ss:Pattern="Solid" />', '</Style>',

                '<Style ss:ID="odddate" ss:Parent="odd">', '<NumberFormat ss:Format="yyyy-mm-dd" />', '</Style>',

                '<Style ss:ID="oddint" ss:Parent="odd">', '<NumberFormat Format="0" />', '</Style>',

                '<Style ss:ID="oddfloat" ss:Parent="odd">', '<NumberFormat Format="0.00" />', '</Style>',


                '</Styles>',
                worksheet.xml, '</Workbook>');
    },

    /*

     Support function to return field info from store based on fieldname

     */

    getModelField: function(fieldName) {

        var fields = this.exportStore.model.getFields();
        for (var i = 0; i < fields.length; i++) {
            if (fields[i].name === fieldName) {
                return fields[i];
            }
        }
    },

    /*

     Convert store into Excel Worksheet

     */

    createWorksheet: function(includeHidden, theTitle,  startIndex, endIndex, endFlag) {

        // Calculate cell data types and extra class names which affect formatting
        var cellType = [];
        var cellTypeClass = [];
        var cm = this.columns;

        var totalWidthInPixels = 0;
        var colXml = '';
        var headerXml = '';
        var visibleColumnCountReduction = 0;
        var colCount = cm.length;
        for (var i = 0; i < colCount; i++) {
            if ((cm[i].dataIndex != '') && (includeHidden || !cm[i].hidden)) {
                var w = cm[i].getEl().getWidth();
                totalWidthInPixels += w;

                if (cm[i].text === "") {
                    cellType.push("None");
                    cellTypeClass.push("");
                    ++visibleColumnCountReduction;
                } else {
                    colXml += '<Column ss:AutoFitWidth="1" ss:Width="' + w + '" />';
                    headerXml += '<Cell ss:StyleID="headercell">' + '<Data ss:Type="String">' + cm[i].text + '</Data>' + '<NamedCell ss:Name="Print_Titles"></NamedCell></Cell>';


                    var fld = this.getModelField(cm[i].dataIndex);
                    switch (fld.type.type) {
                        case "int":
                            cellType.push("Number");
                            cellTypeClass.push("int");
                            break;
                        case "float":
                            cellType.push("Number");
                            cellTypeClass.push("float");
                            break;

                        case "bool":

                        case "boolean":
                            cellType.push("String");
                            cellTypeClass.push("");
                            break;
                        case "date":
//                            cellType.push("Number");
//                            cellTypeClass.push("");
                            cellType.push("String");
                            cellTypeClass.push("");
                            break;
                        default:
                            cellType.push("String");
                            cellTypeClass.push("");
                            break;
                    }
                }
            }
        }
        var visibleColumnCount = cellType.length - visibleColumnCountReduction;

        var result = {
            height: 9000,
            width: Math.floor(totalWidthInPixels * 30) + 50
        };

        // Generate worksheet header details.
        if ( startIndex == 0 ){
            this.t = ''.concat('<Worksheet ss:Name="' + theTitle + '">',

                '<Names>', '<NamedRange ss:Name="Print_Titles" ss:RefersTo="=\'' + theTitle + '\'!R1:R2">', '</NamedRange></Names>',

                '<Table ss:ExpandedColumnCount="' + (visibleColumnCount + 2), '" ss:ExpandedRowCount="' + (this.exportStore.getCount() + 2) + '" x:FullColumns="1" x:FullRows="1" ss:DefaultColumnWidth="65" ss:DefaultRowHeight="15">',
                colXml, '<Row ss:Height="38">', '<Cell ss:MergeAcross="' + (visibleColumnCount - 1) + '" ss:StyleID="title">', '<Data ss:Type="String" xmlns:html="http://www.w3.org/TR/REC-html40">', '<html:b>' + theTitle + '</html:b></Data><NamedCell ss:Name="Print_Titles">', '</NamedCell></Cell>', '</Row>', '<Row ss:AutoFitHeight="1">',
                headerXml + '</Row>');
        } ;

        // Generate the data rows from the data in the Store
        //endIndex > this.exportStore.proxy.data.length ? endIndex = this.exportStore.proxy.data.length: endIndex
        endIndex > this.exportStore.data.items.length ? endIndex =  this.exportStore.data.items.length: endIndex;
        //for (var i = startIndex, it = this.exportStore.proxy.data, l = endIndex; i < l; i++) {
        for (var i = startIndex, it = this.exportStore.data.items, l = endIndex; i < l; i++) {
            this.t += '<Row>';
            var cellClass = (i & 1) ? 'odd' : 'even';
            //r = it[i];
            r = it[i].data;
            var k = 0;
            for (var j = 0; j < colCount; j++) {
                if ((cm[j].dataIndex != '') && (includeHidden || !cm[j].hidden)) {
                    var v = r[cm[j].dataIndex];
                    if (cellType[k] !== "None") {
                        this.t += '<Cell ss:StyleID="' + cellClass + cellTypeClass[k] + '"><Data ss:Type="' + cellType[k] + '">';
                        if (cellTypeClass[k] == 'DateTime') {
//                            v = common.Util.getDate(v);
//                              t += v;
                            this.t += v.format('Y-m-d');
                        } else {
                            //// 0311 xml에서는  < > 부등호나 &기호를 넣으면 문제 발생,해서 변경
                            if (typeof v == 'string') {
                                v = '<![CDATA[' +  v +  ']]>';
//                                var gtIndex = v.indexOf('>');
//                                var ltIndex = v.indexOf('<');
//                                var andIndx = v.indexOf('&');
//
//                                if (gtIndex != -1 || ltIndex != -1 || andIndx != -1) {
//                                    v = v.replace(/[\<>]/g, function (m) {
//                                        return {
//                                            '<': '&lt',
//                                            '>': '&gt',
//                                            '&': '&amp'
//                                        }[m];
//                                    });
//                                }
                            }

                            // 0311 number type에 null 값이 들어있는 경우에는 excel 오플시 에러난다..
                            if (v === null) {
                                v = 0;
                            }

                            this.t += v;
                        }
                        this.t += '</Data></Cell>';
                    }
                    k++;
                }
            }
            this.t += '</Row>';
        } ;

        if ( endFlag ){
            result.xml = this.t.concat('</Table>', '<WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">', '<PageLayoutZoom>0</PageLayoutZoom>', '<Selected/>', '<Panes>', '<Pane>', '<Number>3</Number>', '<ActiveRow>2</ActiveRow>', '</Pane>', '</Panes>', '<ProtectObjects>False</ProtectObjects>', '<ProtectScenarios>False</ProtectScenarios>', '</WorksheetOptions>', '</Worksheet>');
            return result;
        } ;
    }
});

Ext.override(Ext.tree.Panel, {


    /*
     Kick off process
     */

    downloadExcelXml: function(includeHidden, title) {

        var vExportContent = this.getExcelXml(includeHidden, title);

        var location = 'data:application/vnd.ms-excel;base64,' + Base64.encode(vExportContent);

        if (!title) {
            title = this.title;
        }

        /*
         dynamically create and anchor tag to force download with suggested filename
         note: download attribute is Google Chrome specific
         */
        var gridEl = this.getEl();

        var el = Ext.DomHelper.append(gridEl, {
            tag: "a",
            download: title + "-" + Ext.Date.format(new Date(), 'Y-m-d Hi') + '.xls',
            href: location
        });

        el.click();

        Ext.fly(el).destroy();
    },


    /*

     Welcome to XML Hell
     See: http://msdn.microsoft.com/en-us/library/office/aa140066(v=office.10).aspx
     for more details

     */
    getExcelXml: function(includeHidden, title) {

        var theTitle = title || this.title;

        var worksheet = this.createWorksheet(includeHidden, theTitle);
        var totalWidth = this.columns.length;

        return ''.concat('<?xml version="1.0"?>', '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40">', '<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office"><Title>' + theTitle + '</Title></DocumentProperties>', '<OfficeDocumentSettings xmlns="urn:schemas-microsoft-com:office:office"><AllowPNG/></OfficeDocumentSettings>', '<ExcelWorkbook xmlns="urn:schemas-microsoft-com:office:excel">', '<ss:WindowHeight>' + worksheet.height + '</ss:WindowHeight>', '<ss:WindowWidth>' + worksheet.width + '</ss:WindowWidth>', '<ProtectStructure>False</ProtectStructure>', '<ProtectWindows>False</ProtectWindows>', '</ExcelWorkbook>',

                '<Styles>',

                '<Style ss:ID="Default" ss:Name="Normal">', '<Alignment ss:Vertical="Bottom"/>', '<Borders/>', '<Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="12" ss:Color="#000000"/>', '<Interior/>', '<NumberFormat/>', '<Protection/>', '</Style>',

                '<Style ss:ID="title">', '<Borders />', '<Font ss:Bold="1" ss:Size="18" />', '<Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1" />', '<NumberFormat ss:Format="@" />', '</Style>',

                '<Style ss:ID="headercell">', '<Font ss:Bold="1" ss:Size="10" />', '<Alignment ss:Horizontal="Center" ss:WrapText="1" />', '<Interior ss:Color="#E7E7E9" ss:Pattern="Solid" />', '</Style>',


                '<Style ss:ID="even">', '<Interior ss:Color="#FFFFFF" ss:Pattern="Solid" />', '</Style>',


                '<Style ss:ID="evendate" ss:Parent="even">', '<NumberFormat ss:Format="yyyy-mm-dd" />', '</Style>',


                '<Style ss:ID="evenint" ss:Parent="even">', '<Numberformat ss:Format="0" />', '</Style>',

                '<Style ss:ID="evenfloat" ss:Parent="even">', '<Numberformat ss:Format="0.00" />', '</Style>',

                '<Style ss:ID="odd">', '<Interior ss:Color="#FAFAFA" ss:Pattern="Solid" />', '</Style>',

                '<Style ss:ID="odddate" ss:Parent="odd">', '<NumberFormat ss:Format="yyyy-mm-dd" />', '</Style>',

                '<Style ss:ID="oddint" ss:Parent="odd">', '<NumberFormat Format="0" />', '</Style>',

                '<Style ss:ID="oddfloat" ss:Parent="odd">', '<NumberFormat Format="0.00" />', '</Style>',


                '</Styles>',
                worksheet.xml, '</Workbook>');
    },

    /*

     Support function to return field info from store based on fieldname

     */

    getModelField: function(fieldName) {

        var fields = this.store.model.getFields();
        for (var i = 0; i < fields.length; i++) {
            if (fields[i].name === fieldName) {
                return fields[i];
            }
        }
    },

    /*

     Convert store into Excel Worksheet

     */

    createWorksheet: function(includeHidden, theTitle) {
        // Calculate cell data types and extra class names which affect formatting
        var cellType = [];
        var cellTypeClass = [];
        var cm = this.columns;
        var totalWidthInPixels = 0;
        var colXml = '';
        var headerXml = '';
        var visibleColumnCountReduction = 0;
        var colCount = cm.length;
        for (var i = 0; i < colCount; i++) {
            if(i == 0){
                colXml += '<Column ss:AutoFitWidth="1" ss:Width="100" />';
                headerXml += '<Cell ss:StyleID="headercell">' + '<Data ss:Type="String">Index</Data>' + '<NamedCell ss:Name="Print_Titles"></NamedCell></Cell>';
            }

            if ((cm[i].dataIndex != '') && (includeHidden || !cm[i].hidden)) {
                var w = cm[i].getEl().getWidth();
                totalWidthInPixels += w;

                if (cm[i].text === "") {
                    cellType.push("None");
                    cellTypeClass.push("");
                    ++visibleColumnCountReduction;
                } else {
                    colXml += '<Column ss:AutoFitWidth="1" ss:Width="' + w + '" />';
                    headerXml += '<Cell ss:StyleID="headercell">' + '<Data ss:Type="String">' + cm[i].text + '</Data>' + '<NamedCell ss:Name="Print_Titles"></NamedCell></Cell>';


                    //var fld = this.getModelField(cm[i].dataIndex);
                    //switch (fld.type.type) {
                    //var dataType = this.getModelField(cm[i].dataType);
                    var dataType = cm[i].dataType;
                    switch (dataType) {
                        case "int":
                            cellType.push("Number");
                            cellTypeClass.push("int");
                            break;
                        case "float":
                            cellType.push("Number");
                            cellTypeClass.push("float");
                            break;

                        case "bool":

                        case "boolean":
                            cellType.push("String");
                            cellTypeClass.push("");
                            break;
                        case "date":
//                            cellType.push("DateTime");
//                            cellTypeClass.push("date");
                            cellType.push("String");
                            cellTypeClass.push("");
                            break;
                        default:
                            cellType.push("String");
                            cellTypeClass.push("");
                            break;
                    }
                }
            }
        }
        var visibleColumnCount = cellType.length - visibleColumnCountReduction;

        var result = {
            height: 9000,
            width: Math.floor(totalWidthInPixels * 30) + 50
        };

        // Generate worksheet header details.
        var t = ''.concat('<Worksheet ss:Name="' + theTitle + '">',

                '<Names>', '<NamedRange ss:Name="Print_Titles" ss:RefersTo="=\'' + theTitle + '\'!R1:R2">', '</NamedRange></Names>',

                '<Table ss:ExpandedColumnCount="' + (visibleColumnCount + 2), '" ss:ExpandedRowCount="' + 100 + '" x:FullColumns="1" x:FullRows="1" ss:DefaultColumnWidth="65" ss:DefaultRowHeight="15">',
                colXml, '<Row ss:Height="38">', '<Cell ss:MergeAcross="' + (visibleColumnCount - 1) + '" ss:StyleID="title">', '<Data ss:Type="String" xmlns:html="http://www.w3.org/TR/REC-html40">', '<html:b>' + theTitle + '</html:b></Data><NamedCell ss:Name="Print_Titles">', '</NamedCell></Cell>', '</Row>', '<Row ss:AutoFitHeight="1">',
                headerXml + '</Row>');


        var treeExportData = function(data, el, field, cellType, cellTypeClass, depth){
            var cellClass = 'odd',
                    v = '', temp = '', k = 0;

            depth = depth || 0;
            for(var i = 0 ; i < data.length; i++){
                k = 0;
                el += '<Row>';
                if(data[i].data.depth == 1){
                    v = temp = i + 1;
                }else{
                    v = temp = depth + '.' + (1 + data[i].data.index);
                }

                el += '<Cell ss:StyleID="even"><Data ss:Type="String">';
                el += v;
                el += '</Data></Cell>';

                v = '';
                for(var j = 0 ; j < field.length; j++){
                    if ((field[j].dataIndex != '') && (includeHidden || !field[j].hidden)) {
                        v = data[i].data[field[j].dataIndex];
                        if (cellType[k] !== "None") {
                            el += '<Cell ss:StyleID="' + cellClass + cellTypeClass[k] + '"><Data ss:Type="' + cellType[k] + '">';
                            if (cellType[k] == 'DateTime') {
                                el += v.format('Y-m-d');
                            } else {
                                //// 0311 xml에서는  < > 부등호나 &기호를 넣으면 문제 발생,해서 변경
                                if( typeof v == 'string') {
                                    v = '<![CDATA[' +  v +  ']]>';
                                }
                                // 0311 number type에 null 값이 들어있는 경우에는 excel 오플시 에러난다.
                                if (v === null) {
                                    v = 0;
                                }
                                el += v;
                            }
                            el += '</Data></Cell>';
                        }

                        k++;
                    }
                }
                el += '</Row>';



                if(data[i].childNodes.length){
                    el = treeExportData(data[i].childNodes, el, field, cellType, cellTypeClass, temp);
                }
            }
            return el;
        };

        t = treeExportData(this.store.getRootNode().childNodes, t, cm, cellType, cellTypeClass);

        result.xml = t.concat('</Table>', '<WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">', '<PageLayoutZoom>0</PageLayoutZoom>', '<Selected/>', '<Panes>', '<Pane>', '<Number>3</Number>', '<ActiveRow>2</ActiveRow>', '</Pane>', '</Panes>', '<ProtectObjects>False</ProtectObjects>', '<ProtectScenarios>False</ProtectScenarios>', '</WorksheetOptions>', '</Worksheet>');
        return result;
    }
});