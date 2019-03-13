Ext.define('Exem.CheckList', {
    extend: 'Ext.container.Container',
    layout : {
        type : 'hbox',
        pack : 'start'
    },
    height: '100%',
    instanceList : null, // 최초 instanceList
    checkedChange: null, // 리턴받을 함수
    constructor: function() {
        this.callParent(arguments);
        this.initProperty();
        this.createLayer();
    },

    initProperty: function () {
        /*
         CheckList Frame Spec
         InstanceList 를 넘겨받아서 ALL | instance1 instance2 이런식으로 CheckBox List 구성
         ALL 선택시 다른 Instance Check 해제. 다른 Instance 선택 시 All 체크 해제.

         BusinessName 변경 기능 반영해야함. (Label명만 바뀌도록)
         FrameChange 기능 대응해야함. (instanceList 변경 시 Frame 재구성 할 수 있도록)
         */
        this.anotherCheckList            = [];  // All 이 아닌 체크박스들을 저장하는 변수
        this.beforeAnotherCheckStateList = [];  // frameInstanceNameChange 에서 기존 Check상태 저장
        this.beforeAllCheck = true;             // All Check 상태 저장..

        this.returnInstanceList          = [];  // 현재 체크되어 있는 InstanceList 를 리턴하기 위한 변수
        this.allInstanceList             = [];

        this.selectedValue = [];

    },

    createLayer: function(){

        this.anotherCheckList = [];

        this.checkArea = Ext.create('Exem.HListBox', {
            height : 25,
            width  : '100%',
            baseMargin : '0 0 0 0',
            buttonText : true,
            buttonMargin : '3 0 0 0',
            layout : {
                type : 'hbox',
                pack : 'start'
            }
        });

        this.allCheck = Ext.create('Ext.form.field.Checkbox', {
            boxLabel : 'All',
            itemId   : 'all',
            width    : 40,
            checked  : this.beforeAllCheck,
            listeners: {
                scope: this,
                change: this.checkEvent
            }
        });

        var lineCon = Ext.create('Ext.container.Container', {
            layout: 'fit',
            margin: '4 0 6 0',
            width: 10,
            height: '100%'
        });

        var ix, ixLen, tempCheckObj;
        for (ix = 0, ixLen = this.instanceList.length; ix < ixLen; ix++) {
            tempCheckObj = Ext.create('Ext.form.field.Checkbox', {
                itemId  : this.instanceList[ix],
                boxLabel: this.instanceList[ix],
                margin  : '0 5 0 0',
                checked : this.beforeAnotherCheckStateList[ix] ? this.beforeAnotherCheckStateList[ix] : false,
                listeners: {
                    scope: this,
                    change: this.checkEvent
                }
            });

            this.anotherCheckList.push(tempCheckObj);
        }

        this.checkArea.addItem(this.allCheck);
        this.checkArea.addItem(lineCon);
        this.checkArea.addItem(this.anotherCheckList);
        this.add(this.checkArea);

        ix = null;
        ixLen = null;
        tempCheckObj = null;
    },

    checkEvent: function(checkBox, nv){
        if(! nv && this.getCheckedCount() == 0){
            checkBox.suspendEvents(false);
            checkBox.setValue(!nv);
            checkBox.resumeEvents();
            return;
        }

        if(checkBox.itemId == 'all' && nv){
            this.setCheckValue(checkBox.itemId, nv, true);
        }else{
            this.setCheckValue(checkBox.itemId, nv, false);
        }

        if(this.checkedChange){
            this.checkedChange(this.getCheckValue());
        }
    },

    _getCheckList: function() {
        if (this.allCheck.getValue()) {
            return this.instanceList;
        } else {
            return this.returnInstanceList;
        }
    },

    _anotherCheckState: function() {
        /*
         All을 제외한 체크박스가 모두 체크 해제인 상태에서
         마지막남은 체크박스 해제를 막기 위해 검사

         하나라도 True 가 있으면 True 하나도 없으면 False return
         */
        this.returnInstanceList = [];
        this.allInstanceList = [];

        var ix, ixLen;
        var isChecked = false;
        for (ix = 0, ixLen = this.anotherCheckList.length; ix < ixLen; ix++) {
            this.allInstanceList.push(this.anotherCheckList[ix].itemId);
            if (this.anotherCheckList[ix].getValue()) {
                this.returnInstanceList.push(this.anotherCheckList[ix].itemId);
                isChecked = true;
            }
        }

        ix = null;
        ixLen = null;
        return isChecked;

    },

    _anotherCheckClear: function() {
        var ix, ixLen;
        for (ix = 0, ixLen = this.anotherCheckList.length; ix < ixLen; ix++) {
            this.anotherCheckList[ix].setValue(false);
        }

        ix = null;
        ixLen = null;
    },

    frameChange: function(instanceList) {
        this.checkArea.destroy();
        this.instanceList = instanceList;

        this.returnInstanceList = [];
        this.allInstanceList = [];
        this.beforeAnotherCheckStateList = [];

        this.createLayer();
    },

    _anotherBeforeCheckState: function() {
        this.returnInstanceList = [];
        this.allInstanceList = [];
        this.beforeAnotherCheckStateList = [];

        var ix, ixLen;
        for (ix = 0, ixLen = this.anotherCheckList.length; ix < ixLen; ix++) {
            this.beforeAnotherCheckStateList.push(this.anotherCheckList[ix].getValue());
        }

        ix = null;
        ixLen = null;
    },

    frameInstanceNameChange: function() {

        this._anotherBeforeCheckState();
        this.frameChange(this.instanceList);
    },

    isAll: function(){
        return this.beforeAllCheck;
    },

    setCheckValue: function(value, checked, isAll){
        var allChecked = true;
        var ix, ixLen;

        if(! isAll){
            if(checked){
                if(this.selectedValue.length == this.anotherCheckList.length){
                    this.selectedValue.length = 0;
                }
                if(Array.isArray(value)){
                    for(ix = 0, ixLen = value.length; ix < ixLen; ix++){
                        this.selectedValue.push(value[ix]);
                    }
                }else{
                    this.selectedValue.push(value);
                }

                if(this.selectedValue.length != this.anotherCheckList.length){
                    allChecked = false;
                }
            }else if(! checked && this.selectedValue.indexOf(value) > -1){
                this.selectedValue.splice(this.selectedValue.indexOf(value), 1);
                allChecked = false;
            }else{
                this.selectedValue.length = 0;
                allChecked = false;
            }
        }
        this.allCheck.suspendEvents(false);
        if(allChecked){
            this.allCheck.setValue(true);
            this.selectedValue.length = 0;
            for(ix = 0, ixLen = this.anotherCheckList.length; ix < ixLen; ix++){
                this.selectedValue.push(this.anotherCheckList[ix].itemId);
                this.anotherCheckList[ix].suspendEvents(false);
                this.anotherCheckList[ix].setValue(false);
                this.anotherCheckList[ix].resumeEvents();
            }
        }else{
            this.allCheck.setValue(false);

            for(ix = 0, ixLen = this.anotherCheckList.length; ix < ixLen; ix++){
                this.anotherCheckList[ix].suspendEvents(false);
                if(this.selectedValue.indexOf(this.anotherCheckList[ix].itemId) > -1){
                    this.anotherCheckList[ix].setValue(true);
                }else{
                    this.anotherCheckList[ix].setValue(false);
                }
                this.anotherCheckList[ix].resumeEvents();
            }
        }
        this.allCheck.resumeEvents();

        this.beforeAllCheck = allChecked;
    },

    getCheckValue: function(){
        var result = [];

        if(this.beforeAllCheck){
            result = this.instanceList;
        }else{
            for(var ix = 0, ixLen = this.anotherCheckList.length; ix < ixLen; ix++){
                if(this.anotherCheckList[ix].getValue()){
                    result.push(this.anotherCheckList[ix].itemId);
                }
            }
        }

        return result;
    },

    /**
     * 체크된 체크박스 갯수를 리턴합니다.
     * ALL 하나 만 체크 시 1 을 리턴합니다.
     * @returns {number}
     */
    getCheckedCount: function(){
        var count = 0;
        if(this.allCheck.getValue()){
            count = 1;
        }else{
            for(var ix = 0, ixLen = this.anotherCheckList.length; ix < ixLen; ix++){
                if(this.anotherCheckList[ix].getValue()){
                    count++;
                }
            }
        }
        return count;
    }


});