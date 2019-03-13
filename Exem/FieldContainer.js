Ext.define("Exem.FieldContainer", {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.basefieldcontainer',

    selectionMode: null, // single

    getCheckedValue: function() {
        var fields = this.query(this.defaultType);

        for (var i in fields) {
            if (fields[i].checked)
                return fields[i].inputValue;
        }
    },

    getCheckedValueArr : function() {
        var checkboxes = this.query('checkbox');

        var checkedValues = [];
        for (var i = 0, len = checkboxes.length; i < len; i++) {
            if ( checkboxes[i].checked )
                checkedValues.push(checkboxes[i].inputValue);
        }
        return checkedValues;
    },

    getCheckedRow: function() {
        var fields = this.query(this.defaultType);

        for (var i in fields) {
            if (fields[i].checked)
                return { name: fields[i].boxLabel, id: fields[i].inputValue };
        }
    },

    convertToFieldClassName: function(fieldType) {
        var fieldClassName = fieldType.toLowerCase(),
            substrIdx = fieldClassName.indexOf('field');
        if (substrIdx > 0)
            fieldClassName = fieldClassName.substring(0, substrIdx+1);

        switch (fieldClassName) {
            case 'checkbox':
                fieldClassName = 'Exem.Checkbox';
                break;
            case 'radio':
                fieldClassName = 'Exem.RadioField';
                break;
            case 'combobox':
                fieldClassName = 'Exem.ComboBox';
                break;
            default:
                fieldClassName = null;
                break;
        }
        return fieldClassName;
    },

    // 배열 요소 하나씩 Record로 추가.
    addRecords : function(fieldType, records, padding) {
        var recordsToAdd = [],
            inputValueIdx = 0,
            paddingValue = 0,
            fieldClassName = this.convertToFieldClassName(fieldType);

        if (arguments.length === 3)
            paddingValue = padding;

        switch(records[0].length) {
            case 1:
                inputValueIdx = 0;
                break;
            case 2:
                inputValueIdx = 1;
                break;
            default:
                common.Util.printErr(common.Util.TR('Invalid length of record array'), this.addRecords);
                break;
        }

        for (var i=0, len = records.length; i < len; i++) {
            recordsToAdd.push(
                Ext.create(fieldClassName, {
                    boxLabel: records[i][0],
                    inputValue: records[i][inputValueIdx],
                    padding: paddingValue
                })
            );
        }

        if (fieldClassName === 'Exem.Checkbox' && this.selectionMode === 'single') {
            for (var ix in recordsToAdd) {
                if (recordsToAdd[ix]) {
                    recordsToAdd[ix].on('change', this.onChangeSingleSelectionCheckbox);
                }
            }
        }

        this.add(recordsToAdd);
        recordsToAdd = null;
    },

    addRecord : function(fieldType, label, value) {
        var recordToAdd = null,
            fieldClassName = this.convertToFieldClassName(fieldType);

        switch(arguments.length) {
            case 2:
                recordToAdd = Ext.create(fieldClassName, {
                    boxLabel	: label,
                    inputValue	: label
                });
                break;
            case 3:
                recordToAdd = Ext.create(fieldClassName, {
                    boxLabel	: label,
                    inputValue	: value
                });
                break;
            default:
                common.Util.printErr(common.Util.TR('Invalid number of arguments'), this.addRecord);
                break;
        }
        if (fieldClassName === 'Exem.Checkbox' && this.selectionMode === 'single')
            recordToAdd.on('change', this.onChangeSingleSelectionCheckbox);

        this.add(recordToAdd);

        recordToAdd = null;
    },

    lastCheckedField: null,
    onChangeSingleSelectionCheckbox: function() {
        var fieldContainer = this.up();

        if (fieldContainer.lastCheckedField && (fieldContainer.lastCheckedField.id != this.id))
            fieldContainer.lastCheckedField.setValue(false);

        if(this.checked)
            fieldContainer.lastCheckedField = this;
    }
});
