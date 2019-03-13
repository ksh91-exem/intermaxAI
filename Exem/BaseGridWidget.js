Ext.define('Exem.BaseGridWidget', {
    extend           : 'Exem.BaseGrid',

    constructor: function() {
        this.callParent(arguments);
    },

    addColumn: function() {
        var self = this;
        var addGridColumn = function() {
            var aText          = arguments[0][0];
            var aDataIndex     = arguments[0][1];
            var aWidth         = arguments[0][2];
            var aDataType      = arguments[0][3];
            var aColVisible    = arguments[0][4];
            var aColumnHide    = arguments[0][5];
            var aSummaryType   = arguments[0][6];
            var aColumnBGColor = arguments[0][7];


            var dataAlign = 'center';
            var dataType  = 'auto';
            var bgColumnColor = '';
            // 그리드 셀 클릭시 사용되는 editor
            var aCellEditor = null;
            var colType     = null;
            var sortType    = null;
            var widget     = null;
            var xtype      = null;
            var onWidgetAttach = null;

            if (aColVisible == undefined) {
                aColVisible = true;
            }

            if (aColumnHide == undefined) {
                aColumnHide = false;
            }

            if (aColumnHide) {
                aColVisible = false;
            }

            switch (aDataType) {
                case Grid.Number:
                    dataAlign = 'right';
                    dataType = 'int';
                    sortType = 'asInt';
                    colType = Grid.Number;
                    aCellEditor = { xtype: 'numberfield', readOnly: true };
                    break;
                case Grid.Float:
                    dataAlign = 'right';
                    dataType = 'float';
                    sortType = 'asFloat';
                    colType = Grid.Float;
                    aCellEditor = { xtype: 'numberfield', readOnly: true };
                    break;
                case Grid.String:
                    dataAlign = 'left';
                    dataType = 'string';
                    //sortType = 'asText'
                    // 대소문자 상관없이 sort
                    sortType = 'asUCString';
                    colType = Grid.String;
                    aCellEditor = { xtype: 'textfield', readOnly: true };
                    break;
                case Grid.DateTime:
                    dataAlign = 'left';
                    dataType = 'date';
                    sortType = 'asDate';
                    colType = Grid.DateTime;
                    aCellEditor = { xtype: 'datefield', readOnly: true , format: self.localeType};
                    break;
                case Grid.StringNumber:
                    dataAlign = 'right';
                    dataType  = 'auto';
                    sortType = 'asFloat';
                    colType = Grid.StringNumber;
                    aCellEditor = { xtype: 'numberfield', readOnly: true };
                    break;
                case Grid.Widget:
                    xtype   = 'widgetcolumn';
                    widget  = { xtype: aDataIndex };
                    onWidgetAttach = function(column, widget, record) {
                        if(widget.removeChart){
                            widget.removeChart();
                        }

                        widget.init(column, widget, record);
                    };
                    break;
                default:
                    break;
            }

            self._fieldsList[self._fieldsList.length] = { name : aDataIndex, type: dataType, useNull: true, sortType: sortType };
            self.gridStore.setFields (self._fieldsList);
            //1412.17 추가 export All
            self.exportStore.setFields (self._fieldsList);


            if(aColumnBGColor != undefined){
                bgColumnColor = aColumnBGColor;
            }

            var column = {
                'text'       : aText,
                'dataIndex'  : aDataIndex,
                'width'      : aWidth,
                'height'     : self.defaultHeaderHeight,
                'align'      : dataAlign,
                'dataType'   : dataType,
                'style'      : 'text-align:' + self.headerAlign,
                'colvisible' : aColVisible,
                'columnHide' : aColumnHide,
                'hidden'     : !aColVisible,
                'hideable'   : !aColumnHide,
                'summaryType': aSummaryType,
                'tdCls'      : bgColumnColor,
                'info'       : null,
                'editor'     : aCellEditor,
                'colType'    : colType,
                'widget'     : widget,
                'xtype'      : xtype,
                'onWidgetAttach' : onWidgetAttach,
                listeners: {
                    resize: function(){
                        // 컬럼 resize 이벤트 발생시, 해당 summary Label도 resize 해주기
                        if (this.info != null) {
                            this.info.setSize(arguments[1],arguments[2]);
                        }
                    },
                    added: function(){
                        if(aColVisible){
                            var summaryLabel = self._addSummaryTextArea(aWidth, aDataIndex, aSummaryType, dataAlign, aColumnBGColor);
                            // label border를 위해 bgCon을 추가해서 resize시에는 bgCon를 resize해주어야함.
                            this.info = summaryLabel.up();
                            summaryLabel = null;
                        }
                    }
                },

                renderer: function (value, meta) {
                    if(value == undefined){
                        return;
                    }

                    var _value = null,
                        _qtipValue = null;
                    switch (meta.column.dataType) {
                        case 'int':
                            if (meta.column.colType != Grid.StringNumber) {
                                if (value % 1 != 0) {
                                    _value = value;
                                } else {
                                    _value = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                                }
                            } else {
                                _value = value;
                            }
                            meta.tdAttr = 'data-qtip="' + _value + '"';
                            return _value;
                        case 'float':
                            _value = common.Util.toFixed(value,Grid.DecimalPrecision);
                            meta.tdAttr = 'data-qtip="' + _value + '"';
                            return _value;
                        case 'date':
                            _value =   self._translateDateTime(value);
                            meta.tdAttr = 'data-qtip="' + _value + '"';
                            return _value;

                        default :
                            _value = Ext.String.htmlEncode(value);
                            _qtipValue = Ext.String.htmlEncode(_value);
                            meta.tdAttr = 'data-qtip="' + _qtipValue + '"';
                            return _value;
                    }
                }

            };

            if(self.isBeginGroup){
                self.groupColumn.columns.push(column);
            } else{
                if (!self._lockAddColumns) {
                    self.pnlExGrid.headerCt.add(column);
                } else {
                    self._columnsList.push(column);
                }
            }

            aText          = null;
            aDataIndex     = null;
            aWidth         = null;
            aDataType      = null;
            aColVisible    = null;
            aColumnHide    = null;
            aSummaryType   = null;
            aColumnBGColor = null;
            dataAlign      = null;
            dataType       = null;
            bgColumnColor  = null;
            aCellEditor    = null;
            colType        = null;
            column         = null;
            sortType       = null;
            xtype          = null;
            widget         = null;
            onWidgetAttach = null;
        };


        if (self.gridType == Grid.exGrid) {
            addGridColumn.call(this, arguments);
        }

        addGridColumn = null;
    },

    _findColumnIndex: function(dataIndex){
        var ix, ixLen;
        var columnsList = this._columnsList;

        for (ix = 0, ixLen = columnsList.length; ix < ixLen; ix++) {
            if(columnsList[ix].dataIndex === dataIndex){
                columnsList[ix].style = 'text-align:center; color: red;';
                return ix;
            }
        }

        return -1;
    }
});
