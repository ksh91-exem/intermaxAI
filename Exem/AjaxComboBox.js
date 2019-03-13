Ext.define("Exem.AjaxComboBox", {
//    extend : 'Ext.form.field.ComboBox',
    extend : 'Exem.ComboBox',
    multiSelect: false,
    idField: 'id',
    displayField: 'name',
    valueField: 'value',
    width: 300,
    queryMode: 'local',
    //typeAhead: true,
    editable: true,
    triggerAction: 'all',
    showFieldName: false,
    match: false,
    matchColor: '#f00',
    maxHeight: 100,
    searchField: null,
    data: null,
    duplicationField: true,

    constructor : function(config) {
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
                }, { scope : this}),
            listeners: {
                scope: this,
                itemmouseenter: function() {
                    this.setEditable(false);
                },
                itemmouseleave: function() {
                    if (this.editable === false) {
                        this.setEditable(true);
                    }
                },
                itemclick: function() {
                    this.setEditable(true);
                }
            }
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

            }
        };

        this.superclass.constructor.call(this, config);

        this.initArguments();

    },

    initArguments: function(){

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
        var i = 0, result = null, temp = null;

        this.store.clearData();

        if(Array.isArray(data)){
            result = this._searchNode(data, queryString, this.searchField, this.showFieldName, this.duplicationField);
        }else if(typeof data == 'object'){
            result = this._searchTreeNode(data.childNodes, queryString, this.searchField, result, this.showFieldName, this.duplicationField);
        }

        temp = [];
        if(result){
            var list = Object.keys(result);
            var key = null;
            var len = null;
            for(var ix = 0, ixLen = list.length; ix < ixLen; ix++){
                key = list[ix];
                len = result[key].length;
                for(i = 0; i < len; ++i){
                    temp.push(result[key][i]);
                }
            }
        }
        this.store.loadData(temp);

        temp = null;
        data = null;
    },

    _searchNode: function(data, queryString, searchField, showFieldName, duplicationField){
        var i = 0, j = 0, k = 0, len = data.length, fieldLen = searchField.length,
            index = 0, find = false, name = '', result = {}, duplicate = false, value = null;
        var temp = null;
        var displayField = this.displayField, valueField = this.valueField, idField = this.idField;
        for(i = 0; i < len; ++i){
            for(j = 0; j < fieldLen; ++j){
                value = data[i][valueField];
                index = (data[i][searchField[j]] + '').toLowerCase().indexOf(queryString.toLowerCase());
                if(index > -1 ){
                    find = true;
                    name += (showFieldName ? ' [' + searchField[j] + ']' : '') + (data[i][searchField[j]] + '');
                }
            }
            if(find){
                if(result[index] != undefined){
                    if(duplicationField != undefined){
                        for(k = 0; k < result[index].length; k++){
                            if(result[index][k].name == name){
                                duplicate = true;
                            }
                        }

                        if(! duplicate){
                            temp = {};
                            temp[displayField] = name;
                            temp[valueField] = value;
                            temp[idField] = name;
                            result[index].push(temp);
                        }
                        duplicate =  false;
                    }
                }else{
                    temp = {};
                    temp[displayField] = name;
                    temp[valueField] = value;
                    temp[idField] = name;
                    result[index] = [temp];
                }
                find = false;
            }
            name = '';
        }

        data = null;

        return result;
    },

    _searchTreeNode: function(nodes, queryString, fields, result, showFieldName, duplicationField){
        var i = 0, j = 0, k = 0, len = nodes.length, fieldLen = fields.length,
            find = false, name = '', index = 0, duplicate = false;

        result = result || {};
        for(i = 0; i < len; ++i){


            for(j = 0 ; j < fieldLen; ++j){
                index = (nodes[i].data[fields[j]] + '').toLowerCase().indexOf(queryString.toLowerCase());
                if(index > -1 ){
                    find = true;
                    name += (showFieldName ? ' ['+ fields[j] +']' : '') + nodes[i].data[fields[j]];
                }
            }
            if(find){
                if(result[index] != undefined){
                    if(duplicationField != undefined){
                        for(k = 0; k < result[index].length; k++){
                            if(result[index][k].name == name){
                                duplicate = true;
                            }
                        }

                        if(! duplicate){
                            result[index].push({
                                id: name,
                                name: name,
                                value: nodes[i].data
                            });
                        }
                    }else{
                        result[index].push({
                            id: name,
                            name: name,
                            value: nodes[i].data
                        });
                    }
                }else{
                    result[index] = [{
                        id: name,
                        name: name,
                        value: nodes[i].data
                    }];
                }

                find = false;
                duplicate = false;
            }
            name = '';
            this._searchTreeNode(nodes[i].childNodes || [], queryString, fields, result, showFieldName, duplicationField);
        }

        nodes = null;

        return result;
    },

    setSearchField: function(field){
        if(Array.isArray(field)){
            this.searchField = field;
        }else{
            this.searchField.length = 0;
            this.searchField.push(field);
        }

        this.searchQuery(this.data, '');

        field =  null;
    },

    setData: function(data){
        this.data = data || [];

        data= null;
    },

    // JH 0307 추가
    selectByIndex: function(index) {
        this.select( this.getStore().getAt(index) );
    },

    /**
        AjaxCombo의 경우는 내부 store 데이터가 검색 시 변경되는 문제가 있어
        blur 처리 시 record 데이터를 가져오기가 어려우므로 선택된 에이전트(DB)명을
        이용하여 store에 설정할 데이터를 만든다
     **/
    getSelectRecord: function(name){
        var id, record;

        if(name === '(All)'){
            id = '(All)';
        }
        else if(this.fieldLabel === common.Util.TR('Agent')){
            id = common.Util.getWasIdbyName(name);
        }
        else if(this.fieldLabel === common.Util.TR('DB')){
            id = common.Util.getDBIdByName(name);
        }

        if(id){
            record = {name: name, value: id};
        }

        return record;
    },

    ajaxSelectByName: function(name) {
        this.select( this.getStore().findRecord('name', name) );
    },

    ajaxSelectByValue: function(value) {
        this.select( this.getStore().findRecord('value', value) );
    },

    ajaxGetNameDataByValue: function(value){
        if(this.getStore().findRecord('value', value)){
            return this.getStore().findRecord('value', value).data['name'];
        } else{
            return null;
        }
    },

    ajaxGetValueDataByName: function(name){
        if(this.getStore().findRecord('name', name)){
            if(this.getStore().findRecord('name', name).data['name'] === name){
                return this.getStore().findRecord('name', name).data['value'];
            } else{
                return null;
            }
        } else{
            return null;
        }
    }
});
