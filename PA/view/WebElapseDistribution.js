Ext.define('view.WebElapseDistribution', {
    extend: 'Exem.TxnTrendBaseForm',
    title: '',
    sql : {
        elapseTimeScatter     : 'IMXPA_WebResponseInspector_Scatter.sql'
    },
    innerInit: function() {

        this.httpStatusList = [
            {value : 100, name : '1XX'},
            {value : 200, name : '2XX'},
            {value : 300, name : '3XX'},
            {value : 400, name : '4XX'},
            {value : 500, name : '5XX'}
        ];

        this.createLayoutDetailCond();
    },

    createWorkLayout: function() {
        var self = this,
            detailScatterTitle;

        this.workArea = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            flex: 1,
            width: '100%',
            height : '100%',
            minHeight: 265,
            border: 1,
            cls   : 'Exem-Form-workArea',
            style : {
                borderRadius: '6px'
            }
        });


        this.detailScatterBox = Ext.create('Exem.Panel', {
            layout    : 'fit',
            flex      : 1,
            width     : '100%',
            minHeight : 200,
            border    : 0,
            margin    : '0 20 20 20',
            listeners: {
                afterrender: function() {
                    if (self.autoRetrieveRange !== null)
                        this.setLoading(true);
                },
                resize: function() {
                    if(!self.isInitResize) {
                        setTimeout(function() {
                            self.detailScatter.fireEvent('resize');
                        }, 10);
                    }
                    self.isInitResize = false;
                }
            }
        });

        this.detailScatter = Ext.create('Exem.chart.D3ScatterSelectable', {
            type                : 'detail',
            target              : this.detailScatterBox,
            parentView          : self,
            isDistribution      : true,
            detailScatterYRange : this.detailScatterYRange
        });

        detailScatterTitle = Ext.create('Ext.panel.Panel', {
            html   : '<p class="res-inspector-title">'+common.Util.TR('Response Time Chart')+'</p>',
            width  : '100%',
            height : 30,
            margin : '15 0 0 30',
            border : 0
        });

        this.minElapseField.setValue(0);
        this.workArea.add([detailScatterTitle, this.detailScatterBox]);
    },

    createLayoutDetailCond: function() {

        var ix, ixLen;

        this.txnNameField = Ext.create('Exem.TextField', {
            itemId     : 'txnNameField',
            fieldLabel : common.Util.CTR('Transaction Name'),
            labelWidth : 120,
            x          : 10,
            y          : 40,
            width      : 350,
            value      : '%',
            maxLength  : 300
        });

        this.ipField = Ext.create('Exem.TextField', {
            fieldLabel : common.Util.CTR('IP'),
            labelWidth : 20,
            x          : 412,
            y          : 40,
            width      : 200,
            value      : '%',
            maxLength  : 41 // %255.255.255.255% or %0000:0000:0000:0000:0000:0000:0000:0000%
        });

        this.cbxHttpStatus = Ext.create('Exem.ComboBox', {
            fieldLabel  : common.Util.TR('Http Status'),
            labelWidth  : 70,
            x           : 747 ,
            y           : 40,
            width       : 200,
            store       : Ext.create('Exem.Store'),
            editable    : false,
            useSelectFirstRow : true,
            multiSelect : true,
            listeners : {
                select: function( combo, records) {
                    var lastSelect = records[records.length-1];
                    if(combo.getValue() !== null){
                        if (lastSelect.data.name === common.Util.TR('(All)')) {
                            combo.reset();
                            combo.setValue( common.Util.TR('(All)') );
                        } else {
                            if (combo.getValue().indexOf( common.Util.TR('(All)') ) !== -1) {
                                combo.reset();
                                combo.setValue(lastSelect.data[1]);
                            }
                        }
                    } else {
                        if (combo.getRawValue().indexOf(common.Util.TR('(All)') ) === -1) {
                            combo.reset();
                            combo.setValue(records);
                        }
                    }
                }
            }
        });

        for(ix=0, ixLen=this.httpStatusList.length; ix<ixLen; ix++) {
            this.cbxHttpStatus.addItem(this.httpStatusList[ix].value, this.httpStatusList[ix].name, ix+1);
        }
        this.cbxHttpStatus.insertAll();
        this.cbxHttpStatus.selectRow();

        this.httpTypeField = Ext.create('Exem.TextField', {
            fieldLabel : common.Util.CTR('Http Type'),
            labelWidth : 70,
            x          : 56,
            y          : 75,
            width      : 220,
            maxLength  : 50,
            value      : '%'
        });


        this.tidField = Ext.create('Exem.TextField', {
            fieldLabel: 'TID',
            labelWidth: 20,
            x: 419,
            y: 75,
            width: 250,
            value: '',
            defaultEmptyText: '',
            maxLength: 300,
            maskRe : /^[0-9]*$/
        });

        if(this.chartToggle) {
            this.chartToggle.setVisible(false);
        }

        this.conditionArea.add([this.txnNameField, this.ipField, this.cbxHttpStatus, this.httpTypeField, this.tidField]);

    },

    retrieve: function() {
        var self = this,
            maxElapse, tmpTxnName;

        if (this.retrieve_loading) {
            return;
        }

        this.retrieve_loading = true;
        this.detailScatter.retrieveLoading = this.retrieve_loading;

        this.isInit = false;

        this.isNotMoreData = false;
        this.fromRowIndex = 0;
        this.limitData = this.defaultLimitData;
        this.limitFrom = 0;

        var result =  this.wasField.checkValid() && this.checkValid();

        if (result) {
            this.minElapse = this.minElapseField.getValue()*1000;

            if (this.maxElapseField.getValue() == common.Util.TR('infinite')) {
                maxElapse = 'infinite';
            }
            else {
                maxElapse = this.maxElapseField.getValue()*1000;
            }

            tmpTxnName = this.txnNameField.value ;
            if (tmpTxnName.indexOf(']') > 0) {
                tmpTxnName = tmpTxnName.substr(tmpTxnName.indexOf(']')+2, tmpTxnName.length) ;
            }

            this.setRetrieveRange({
                timeRange   : [new Date(self.datePicker.mainFromField.getValue()), new Date(self.datePicker.mainToField.getValue())],
                elapseRange : [self.minElapseField.getValue()*1000, maxElapse],
                txnName     : [ tmpTxnName ]
            });

            this.init_elapse_min = self.minElapseField.getValue() ;
            this.init_elapse_max = Number(self.maxElapseField.getValue() ) ;

            var txnName = this.txnNameField.getValue(),
                httpType = this.httpTypeField.getValue(),
                chkException = this.exceptionToggle.getValue(),
                clientIp = common.Util.strIpToHex(this.ipField.getValue()),
                tid = this.tidField.getValue();

            if (txnName == '%'){
                this._txnNameRepl = '';
            }
            else {
                this._txnNameRepl = 'AND business_name LIKE \'' + txnName + '\'';
            }

            if (clientIp == '%'){
                this._clientIpRepl = '';
            }
            else{
                this._clientIpRepl = 'AND client_ip LIKE \''+clientIp+'\' ';
            }

            if (chkException) {
                this._exceptionRepl = '';
            }
            else {
                this._exceptionRepl = 'AND http_status >= 400 ';
            }

            if (httpType == '%'){
                this._httpTypeRepl = '';
            }
            else {
                this._httpTypeRepl = 'AND http_method LIKE \'' + httpType + '\'';
            }

            if (!tid) {
                this._tidRepl = '';
            }
            else {
                this._tidRepl = 'AND tid = ' + tid;
            }

        }
        else {
            console.warn('Failed validation - ', this.title);
            if (typeof result == 'string'){
                console.warn('message :', result);
            }
            this.retrieve_loading = false;
            this.detailScatter.retrieveLoading = this.retrieve_loading;

            return;
        }

        result = this.datePicker.checkValid() ;

        if (!result){
            console.warn('Failed validation - ', this.title);
            if (typeof result == 'string') {
                console.warn('');
            }

            this.retrieve_loading = false;
            this.detailScatter.retrieveLoading = this.retrieve_loading;

        }
        else {
            this.setTitleWithTimeRange();
            this.executeSQL();
        }
    },

    executeSQL: function() {

        this.retrieve_click = true;
        this.init_time = null;
        this.completeScatterSqlExec = false;
        this.completeGridListSqlExec = false;

        this.retrieveScatter();

    },

    retrieveScatter: function() {
        var time_zone;

        if (!this.detailScatterBox.el) {
            this.isChartDom = false;
            return;
        }

        this.detailScatterBox.loadingMask.showMask();

        this.scatterWidth = this.detailScatterBox.getWidth();
        this.scatterHeight = this.detailScatterBox.getHeight();

        //한국시간 offset값 -3240000이어서 기본값 음수.
        time_zone = new Date().getTimezoneOffset() * 1000 * 60;

        //만약 offset값이 양수일 경우는 문자열 + 를 넣어서 sql상 error가 발생 안하도록 변경.
        if (time_zone > 0) {
            time_zone = '+' + time_zone;
        }

        WS.SQLExec({
            sql_file: this.sql.elapseTimeScatter,
            bind: [{
                name: 'fromTime', value: this.fromTime, type: SQLBindType.STRING
            }, {
                name: 'toTime', value: this.toTime, type: SQLBindType.STRING
            }, {
                name: 'minElapse', value: this.minElapse, type: SQLBindType.FLOAT
            }, {
                name: 'maxElapse', value: this.maxElapse, type: SQLBindType.FLOAT
            }],
            replace_string: [{
                name: 'wsId', value: this.getWasList()
            }, {
                name: 'txnName', value: this._txnNameRepl
            }, {
                name: 'clientIp', value: this._clientIpRepl
            }, {
                name: 'httpStatus', value: this.getHttpStatusList()
            }, {
                name: 'httpType', value: this._httpTypeRepl
            }, {
                name: 'exception', value: this._exceptionRepl
            }, {
                name: 'tid', value: this._tidRepl
            }, {
                name: 'time_zone', value: time_zone
            }]
        }, this.onScatterData, this);
    },

    onScatterData: function(header, data) {
        if(this.isClosed){
            return;
        }

        this.detailScatter.fromTime = new Date(this.fromTime) ;
        this.detailScatter.toTime =   new Date(this.toTime) ;

        this.detailScatter.lastSelectRange = {invMinX : null, invMaxX : null, invMinY : null, invMaxY : null};

        this.isChartDataVisible = (this.detailScatter.target.getWidth() > 0);

        this.detailScatter.draw(data.rows, this.scatterWidth, this.scatterHeight);
        this.detailScatterBox.setLoading(false);
        this.detailScatterBox.loadingMask.hide();

        this.completeScatterSqlExec = true;


        this.retrieve_loading = false;
        this.detailScatter.retrieveLoading = this.retrieve_loading;
    },

    setToggleSlide: function(state){
        if(!state) {
            this.txnNameField.setValue('%');
            this.httpTypeField.setValue('%');
            this.cbxHttpStatus.selectRow(0);
            this.tidField.setValue('');
            this.ipField.setValue('%');
            if (!this.exceptionToggle.getValue()){
                this.exceptionToggle.toggle();
            }
        }
    },

    getHttpStatusList: function() {

        var ix,ixLen,
            statusVal = '', tmpStatusArr;


        if(this.cbxHttpStatus.rawValue === common.Util.TR('(All)')) {
            statusVal = '';
        }
        else {
            tmpStatusArr = this.cbxHttpStatus.getValue();
            statusVal += 'and ( ';

            for(ix=0, ixLen=tmpStatusArr.length; ix<ixLen; ix++) {
                statusVal += '(http_status >= ' + tmpStatusArr[ix] + ' and http_status <= ' + (tmpStatusArr[ix]+99)+')';
                if(ix < tmpStatusArr.length -1) {
                    statusVal += ' or ';
                }
            }
            statusVal += ' )'
        }

        return statusVal;
    }
});
