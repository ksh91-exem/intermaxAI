Ext.define("Exem.ComboBox", {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.basecombobox',
    fieldLabel: '',
    labelAlign: 'right',
    labelSeparator: '',
    store: null,
    queryMode: 'local',
    //forceSelection: true,
    editable: false,
    valueField: '1',
    displayField: '2',
    typeAhead: false,

    cls : 'xm-combobox',
    useSelectFirstRow: true,

    constructor: function() {
        this.callParent(arguments);

        /**
         * combobox의 selection ( boundlist ) 가 최초 펼처질때 윈도우 일 경우 윈도우의 프로퍼티로 dom 이 붙게 됩니다.
         * close ( destory ) 시 윈도우 프로퍼티로 존재하는 dom 이 삭제가 되어 selection ( boundlist ) 를 찾을 수 없게 됩니다.
         * 단순 close 액션 시에는 상관이 없지만 윈도우에서 다른 레이어로 콤포넌트 이동이 필요한 경우 해당 dom 이 없어 발생되는 문제를
         * 해결하기 위해 selection ( boundlist ) 가 보이기 전에 해당 dom 이 있는지 체크를 하는 로직을 추가합니다.
         *
         * 추가 로직은 beforequery 이며, intermax의 경우 el이 남아있어 maxgauge와 다른 조건으로 처리하며 DOM을 정상적으로 지우기 위해 destroy 사용
         * 단순히 dom만 지울 경우 센차 내부에서 DOM 삭제를 인식하지 못하는 부분이 생김
         */
        this.addListener("beforequery", function() {
            if(this.picker && this.picker.zIndexManager && this.picker.zIndexManager.targetEl == null){
                this.destroyBoundList();
            }
        }.bind(this));

        this.addListener("afterrender", function() {
            var minWidth ;
            if (this.isVisible() && this.bodyEl && this.bodyEl.getWidth) {
                minWidth = this.bodyEl.getWidth();
            }

            this.listConfig = {
                minWidth : minWidth,
                maxWidth : 500
            };

            if(this.useSelectFirstRow) {
                this.selectRow(0);
            }
        }.bind(this));


        this.addListener("beforedestroy", function() {
            if(this.picker && this.picker.zIndexManager && this.picker.zIndexManager.targetEl == null){
                this.destroyBoundList();
            }

        }.bind(this));
    },

    destroyBoundList: function() {
        var pickerDOM = this.picker.el.dom;

        this.picker = null;
        Ext.destroy(pickerDOM);

        pickerDOM = null;
    },

    getReplValue: function() {
        var self = this;

        if (self.getValue() === '(All)') {
            var store = this.getStore();
            var values = [];

            // all의 index가 0이므로 실제 레코드가 있는 1부터 꺼냄.
            for (var i = 1, len = store.getCount(); i < len; i++)
                values.push( store.getAt(i).get('1') );

            return values.join(',');
        }
        else
            return String(self.getValue());
    },

    // 아이템을 추가한다.
    addItem: function(itemA, itemB, idx) {
        var store = this.getStore();

        switch(arguments.length) {
            case 1:
                store.insert(store.length, {'1': itemA, '2': itemA});
                break;
            case 2:
                store.insert(store.length, {'1': itemA, '2': itemB});
                break;
            case 3:
                store.insert(idx, {'1': itemA, '2': itemB});
                break;
            default:
                common.Util.printErr(common.Util.TR('Invalid number of arguments'), this.addItem);
                break;
        }
        itemA = null;
        itemB = null;
    },

    // 배열로 구성된 아이템을 추가한다.
    addItems: function(items) {
        var i;
        if(items[0].length === 1) {
            for (i in items) {
                if (items[i] !== null && items[i] !== undefined) {
                    this.addItem(items[i]);
                }
            }
        } else {
            for (i in items) {
                if (items[i] !== null && items[i] !== undefined) {
                    this.addItem(items[i][0], items[i][1]);
                }
            }
        }
        items = null;
    },

    // 등록된 모든 아이템을 삭제한다.
    removeAll: function() {
        this.getStore().removeAll();
        this.selectRow(0);
    },

    // 인덱스에 해당하는 아이템을 삭제한다.
    removeItem: function(index) {
        this.getStore().removeAt(index);
        this.selectRow(0);
    },

    insertAll: function() {
        this.addItem('(All)', '(All)', 0);
    },

    selectRow: function(idx) {
        this.select( this.getStore().getAt(idx) );
    },

    // selectBy 둘다 combobox 자신을 부모에 add 한 이후에만 동작함.
    selectByValue: function(value) {
        this.select( this.getStore().findRecord('1', value) );
    },

    selectByName: function(name) {
        this.select( this.getStore().findRecord('2', name) );
    },

    selectExactByName: function(name) {
        this.selectRow( this.getStore().findExact('2', name) );
    }
});
