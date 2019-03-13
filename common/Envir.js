/**
 * 각종 타입 설정
 *   [!] 작성할 때 띄어쓰기 잘 맞춰주세요.
 *   [!] 어떤 속성값으로 사용되는지 comment 작성해주세요.
 */
var Colors = ['#3ca0ff','#90db3b','#00c4c5','#ffde00','#0052ff','#ff7781','#3191c8','#5048c1','#5bc89e','#28776f',
          '#17becf','#beaa3c','#cedc96','#c86ebd','#5e5e5e','#969696','#709d34','#24456b','#dace90','#888bd7'];

var BuildNumber =  '5.2.180730.05';
/***************************************************************************************************************
 *
 * Configuration *
 ***************************************************************************************************************/
var nation = 'en';
var msgMap = null;

(function(){
    var myLang = String(localStorage.getItem('Intermax_MyLanguage'));
    if (myLang == 'null') {
        myLang = null;
    }
    var local = myLang || navigator.language || window.nation;

    //언어 체크 시 대소문자 예외가 있을 수 있어 일괄 소문자로 변경하여 체크
    if (local) {
        local = local.toLocaleLowerCase();
    }

    //한국어
    if (local == 'ko' || local == 'ko-kr') {
        local = 'ko';

    //일본어
    } else if (local == 'ja') {
        local = 'ja';

    //그 외 언어인 경우에는 영어로 표시 처리
    } else {
        local = 'en';
    }

    // Exem Language
    document.write( '<script type="text/javascript" src="../common/locale/exem-lang-'+local+'.js" charset="utf-8"><\/script>');
    // Ext Language
    document.write( '<script type="text/javascript" src="../common/locale/ext-lang-'+local+'.js" charset="utf-8"><\/script>');

    window.nation = local;
})();
/***************************************************************************************************************
 *
 * View Layout *
 ***************************************************************************************************************/
var Layout = {
    Absolute: 0,
    Accordian: 1,
    Anchor: 2,
    Border: 3,
    Card: 4,
    Column: 5,
    Fit: 6,
    Table: 7,
    VBox: 8,
    HBox: 9
};

/***************************************************************************************************************
 *
 * DatePicker Type
 *
 ***************************************************************************************************************/
var DisplayTimeMode = {
    HMS : 1,
    HM  : 2,
    H   : 3,
    None: 4,
    HMSMS : 5,
    YM  : 6
};
var FieldUI = {
    VBOX: 1,
    HBOX: 2
};

var DatePicker = {
    FromTo : 1,
    oneDay : 2
};

/***************************************************************************************************************
 *
 * Grid Type
 *
 ***************************************************************************************************************/
var Grid = {
    String       : 0,                               // column data type: String
    Number       : 1,                               // column data type: Number
    Float        : 2,                               // column data type: Float,
    DateTime     : 3,                               // column data type: DataTime,
    StringNumber : 4,
    CheckBox     : 5,
    ComboBox     : 6,
    tree         : 7,
    Button       : 8,
    Bar          : 9,                               // colulmn type: Bar Chart
    Toggle       : 10,                              // colulmn type: widget Coulumn
    Widget       : 11,

    headerAlignLeft: 100,                           // column header align : LEFT
    headerAlignRight: 101,                          // column header align : RIGHT
    headerAlignCenter: 102,                         // column header align : CENTER
    exGrid: 200,                                    // grid type
    exTree: 201,                                    // tree type
    Total: 'sum',                                   // Summary Column Type
    Avg: 'average',
    Min: 'min',
    Max: 'max',
    Count: 'count',
    DecimalPrecision: 3,
    columnBGColorType1:'columnBGColorType1',
    columnBGColorType2:'columnBGColorType2',
    columnBGColorType3:'columnBGColorType3',
    columnBGColorType4:'columnBGColorType4',
    columnBGColorType5:'columnBGColorType5',
    columnBGColorType6:'columnBGColorType6',
    columnTextColorType1: 'columnTextColorType1',
    columnTextColorType2: 'columnTextColorType2',
    columnTextColorType3: 'columnTextColorType3',

    checkMode :{
        SINGLE: 'SINGLE',
        SIMPLE: 'SIMPLE',
        MULTI : 'MULTI'
    }
};

/***************************************************************************************************************
 *
 * ComboBox Type
 *
 ***************************************************************************************************************/

var ComboBox = {
    was: null,
    db: null,
    group: null,
    web: null,
    refMap: {}
};

/***************************************************************************************************************
 *
 * Chart Type
 *
 ***************************************************************************************************************/

var PlotChart = {
    type: {
        exLine: 'lines',
        exBar: 'bars',
        exHBar: 'hbars',
        exScatter: 'points',
        exPie: 'pie'
    },
    region: {
        exTop: 'north',
        exRight: 'east',
        exLeft: 'west',
        exBottom: 'south'
    },
    chartSelectMode: {
        X: 'x',
        Y: 'y',
        XY: 'xy'
    },
    event: {
        exClick: 'plotclick',
        exDblClick: 'plotdblclick',
        exSelected: 'plotselected',
        exHover: 'plothover'
    },
    time: {
        exSecond: 1000,
        exMin: 60000,
        exTenMin: 600000,
        exHour: 3600000,
        exDay: 86400000
    },
    legendOrder: {
        exAsc: 'asc',
        exDesc: 'desc'
    }
};



/***************************************************************************************************************
*
* Array, Object Store Define
*
***************************************************************************************************************/

var Define = {
   threadStateType :
       [
        'NEW',          'RUNNABLE',     'BLOCKED',          'WAITING',        'TIMED_WAITING',  //  0  4
        '',             '',             '',                 '',               '',               //  5  9
        'TERMINATED',   'EJB_OBJ',      'EJB_LOCAL_HOME',   'EJB_LOCAL_OBJ',  '',               // 10 14
        '',             '',             '',                 '',               '',               // 15 19
        'RMI_CALL',     '',             '',                 '',               '',               // 20 24
        '',             '',             '',                 '',               '',               // 25 29
        'JNI_CALL',     '',             '',                 '',               '',               // 30 34
        '',             '',             '',                 '',               '',               // 35 39
        'NETWORK_IO',   '',             '',                 '',               '',               // 40 44
        '',             '',             '',                 '',               '',               // 45 49
        'FILE_IO',      '',             '',                 '',               '',               // 50 54
        '',             '',             '',                 '',               '',               // 55 59
        'CONN_OPEN',    'CONN_CLOSE',   'STMT_OPEN',        'STMT_EXECUTE',   'STMT_CLOSE',     // 60 64
        'RS_OPEN',      'RS_NEXT',      'RS_CLOSE' ,        '',               '',               // 65 69
        '',             '',             '',                 '',               '',               // 70 74
        '',             '',             '',                 '',               '',               // 75 79
        '',             '',             '',                 '',               '',               // 80 84
        '',             '',             '',                 '',               '',               // 85 89
        '',             '',             '',                 '',               '',               // 90 94
        '',             '',             '',                 '',               ''                // 95 99
        ]
};

/***************************************************************************************************************
 *
 * StatChange Type
 *
 ***************************************************************************************************************/
var StatChange = {
    stat  : 0,
    wait  : 1,
    ratio : 2,
    osstat: 3
};

var TrendStatChange = {
    stat  : 0,
    db    : 1,
    wait  : 2,
    gc    : 3,
    pool  : 4
};


var RendererType = {
    bar : 0
} ;

/***************************************************************************************************************
 *
 * SQL Bind Data Type
 *
 ***************************************************************************************************************/
var SQLBindType = {
    SHORT : 'short',
    INTEGER : 'integer',
    FLOAT : 'float',
    LONG : 'long',
    STRING : 'string'
};
