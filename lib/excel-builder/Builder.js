Paths = {};
/**
* @module Excel
*/
function Builder() {}

_.extend(Builder.prototype, {
    createWorkbook: function () {
        return new Workbook();
    },
    /**
     * Turns a workbook into a downloadable file.
     * @param {Excel/Workbook} workbook The workbook that is being converted
     * @param {Object} options - options to modify how the zip is created. See http://stuk.github.io/jszip/#doc_generate_options
     */
    createFile: function (workbook, options) {
        //var zip = new JSZip();
        var files = workbook.generateFiles();

         //jykim : client에서 압축 시 메모리 오버플로우 때문에 압축작업은 하지 않고 파일만 전달
        //_.each(files, function (content, path) {
        //    path = path.substr(1);
        //    if (path.indexOf('.xml') !== -1 || path.indexOf('.rel') !== -1) {
        //        zip.file(path, content, {base64: false});
        //    } else {
        //        zip.file(path, content, {base64: true, binary: true});
        //    }
        //});

        //return zip.generate(_.defaults(options || {}, {
        //    type: "base64"
        //}));

        return files;
    },

    base64Encode: function(data){
        var zip = new JSZip();
        var inputString;
        var encodeData;

        //inputString = data.join("");
        encodeData = zip.generateDataToBase64(data);

        inputString = null;

        return encodeData;

    },

    base64Decode: function(data){
        var zip = new JSZip();
        //var inputString = data.join("");

        return zip.generateBase64ToData(data);
    }
});