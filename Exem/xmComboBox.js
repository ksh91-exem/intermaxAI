/**
 * Created by bangkinam on 2014. 11. 13.
 */

Ext.define('Exem.xmComboBox', {
    extend: 'Ext.form.field.ComboBox',
    labelAlign: 'right',
    labelWidth: 40,
    editable: false,
    queryMode: 'local',
    forceSelection: true,
    multiSelect: false,
    displayField: 'name',
    valueField: 'value',
    matchColor: '#f00',
    listeners: {
        afterrender: function() {
            this.select(this.getStore().getAt(0));
        }
    },
    AllWasList: [],
    data: [],
    searchField: null,

    constructor: function(config) {
        this.store = Ext.create('Ext.data.Store', {
            data: [],
            fields: ['name', 'value']
        });

        /**
         * listConfig Object Overide!
         *
         * HighLightMatching process
         */
        this.listConfig = {
            itemTpl: Ext.create('Ext.XTemplate',
                '{[this.highlightMatch(values.name)]}', {
                    highlightMatch: function (input) {
                        var searchQuery = this.scope.el.dom.querySelector('input').value.replace(/\(/g, '\\(').replace(/\)/g, '\\)');
                        var searchQueryRegex = new RegExp("(" + searchQuery + ")", "i"); // case-insensitive
                        var highlightedMatch = '<span style="font-weight:600;color:'+ this.scope.matchColor +'">$1</span>';
                        return input.replace(searchQueryRegex, highlightedMatch);
                    }
                }, { scope : this})
        };
        /**
         * onListSelectionChange event Overide!
         */
        this.onListSelectionChange = function(list, selectedRecords) {
            var me = this,
                isMulti = me.multiSelect,
                hasRecords = selectedRecords.length > 0;


            if (!me.ignoreSelection && me.isExpanded) {
                if (!isMulti) {
                    Ext.defer(me.collapse, 1, me);
                }

                if (isMulti || hasRecords) {
                    me.setValue(selectedRecords, false);
                }
                if (hasRecords) {
                    me.fireEvent('select', me, selectedRecords);
                }
                me.inputEl.focus();

                this.listKeyNav.boundList.refresh();
            }
        };

        this.superclass.constructor.call(this, config);

        this.initArguments();
    },

    initArguments: function() {
        this.searchField = this.searchField || [];
        this.data = this.data || [];
    },

    /**
     * Overide Method.
     * @param queryPlan
     */
    doLocalQuery: function(queryPlan) {
        var me = this,
            queryString = queryPlan.query;

        me.searchQuery(this.data || [] , queryString);

        if (me.store.getCount()) {
            me.expand();
        } else {
            me.collapse();
        }
    },

    searchQuery: function(data, queryString){
        var i, temp, result = null;
        this.store.data.items.length = 0;

        if (Array.isArray(data)) {
            result = this.searchNode(data, queryString, this.searchField, this.showFieldName, this.duplicationField);
        }

        temp = [];
        if (result) {
            var len;
            for (var key in result) {
                if (!result[key]) {
                    continue;
                }
                len = result[key].length;
                for (i = 0; i < len; ++i) {
                    temp.push(result[key][i]);
                }
            }
        }
        this.store.loadData(temp);
    },

    searchNode: function(data, queryString, searchField, showFieldName, duplicationField) {
        var i = 0, j = 0, k = 0, len = data.length, fieldLen = searchField.length,
            index = 0, find = false, name = '', result = {}, duplicate = false, value = null;
        var temp = null;
        var displayField = this.displayField, valueField = this.valueField;
        for (i = 0; i < len; ++i) {
            for (j = 0; j < fieldLen; ++j) {
                value = data[i][valueField];
                index = (data[i][searchField[j]] + '').toLowerCase().indexOf(queryString.toLowerCase());
                if (index > -1 ) {
                    find = true;
                    name += (showFieldName ? ' [' + searchField[j] + ']' : '') + (data[i][searchField[j]] + '');
                }
            }
            if (find) {
                if (result[index] != undefined) {
                    if (duplicationField != undefined) {
                        for (k = 0; k < result[index].length; k++) {
                            if (result[index][k].name == name) {
                                duplicate = true;
                            }
                        }

                        if (!duplicate) {
                            temp = {};
                            temp[displayField] = name;
                            temp[valueField] = value;
                            result[index].push(temp);
                        }
                    }
                } else {
                    temp = {};
                    temp[displayField] = name;
                    temp[valueField] = value;
                    result[index] = [temp];
                }
                find = false;
            }
            name = '';
        }

        return result;
    },

    setSearchField: function(field){
        if (Array.isArray(field)) {
            this.searchField = field;
        } else {
            this.searchField.length = 0;
            this.searchField.push(field);
        }

        this.searchQuery(this.data, '');
    },

    setData: function(data){
        this.data = data || [];
    },

    selectByIndex: function(index) {
        this.select(this.getStore().getAt(index));
    },

    addItem: function(item_name, item_value, item_index) {
        var store = this.getStore();

        switch(arguments.length) {
            case 1:
                store.insert(store.length, {'name': item_name, 'value': item_name});
                break;
            case 2:
                store.insert(store.length, {'name': item_name, 'value': item_value});
                break;
            case 3:
                store.insert(item_index, {'name': item_name, 'value': item_value});
                break;
            default:
                break;
        }

        this.setStore(store);
    },

    selectRow: function(item_index) {
        this.select(this.getStore().getAt(item_index));
    }
});