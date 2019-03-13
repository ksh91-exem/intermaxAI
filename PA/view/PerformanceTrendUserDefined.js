/**
 * Created by min on 2015-10-02.
 */
Ext.define('view.PerformanceTrendUserDefined', {
    extend     : 'Exem.XMWindow',
    title      : common.Util.TR('User Defined'),
    layout     : 'vbox',
    width      : 660,
    height     : 410,
    modal      : true,
    resizable  : false,
    closeAction: 'hide',
    cls        : 'Exem-Form-workArea',
    bodyStyle  : {
        background: '#fff',
        color     : '#666'
    },

    total_stat_list : { Stat: [], DB: [], Wait: [], GC: [] } ,  //stat - 643개, wait - 1200개..(부모)
    last_stat_list    : { Stat: [], DB: [], Wait: [], GC: [] } ,   //사용자가 가장 마지막에 선택한 그리드 값들.
    last_stat_list_id : { Stat: [], DB: [], Wait: [], GC: [] } ,


    curr_type        : null ,
    scope            : null ,
    curr_active_tab  : null , //부모의 현재 액티브된 탭 -> 스탯저장후 바로 그화면에 적용시켜주기위해.
    db_id            : null ,
    is_visible       : false,
    flag_refresh     : null ,
    view_name        : null ,
    visible_stat_list: null ,
    db_visible       : null ,
    wait_visible     : null ,

    loadUserDefined: function(isInit) {
        var ix, ixLen, jx, jxLen, kx, kxLen,
            web_env_data, web_env_id,
            self = this;

        var push_list = function(env_key, key) {

            for (ix = 0, ixLen = self.all_type.length; ix < ixLen; ix++) {
                web_env_data = Comm.web_env_info[env_key + '_' + self.all_type[ix]];
                web_env_id   = Comm.web_env_info[env_key + '_id_' + self.all_type[ix]];

                if (web_env_data == undefined) {
                    continue;
                }

                for (jx = 0, jxLen =  web_env_data.length; jx < jxLen; jx++) {

                    if (self.defined_list[ self.all_type[ix] ] == undefined) {
                        self.defined_list[ self.all_type[ix] ] = {
                            'Stat': { 0: [], 1: [], 2: [], 3: [] },
                            'DB'  : { 0: [], 1: [], 2: [], 3: [] },
                            'Wait': { 0: [], 1: [], 2: [], 3: [] },
                            'GC'  : { 0: [], 1: [], 2: [], 3: [] }
                        };
                    }

                    if (common.Util.CTR(web_env_data[ jx ]) == common.Util.CTR('CPU Usage')) {
                        web_env_data[ jx ] = 'CPU Usage';
                    }

                    self.defined_list[ self.all_type[ix] ][key][0].push(web_env_data[jx]);
                    self.defined_list[ self.all_type[ix] ][key][1].push(key);
                    self.defined_list[ self.all_type[ix] ][key][2].push(web_env_id[jx]);
                    self.defined_list[ self.all_type[ix] ][key][3].push(web_env_data[jx]);
                }
            }
        };

        //webEnv에는 값들 전체오브젝배열에 담기.
        for (kx = 0, kxLen = this.visible_stat_list.length; kx < kxLen; kx++) {

            switch (this.visible_stat_list[kx]) {

                case 'stat':
                    if (isInit) {
                        this.left_tab_pnl.items.items[0].tab.setVisible(true);
                    }

                    push_list(this.IDXDB_STAT, 'Stat');
                    break;

                case 'db'  :
                    if (isInit) {
                        this.left_tab_pnl.items.items[1].tab.setVisible(true);
                    }

                    push_list(this.IDXDB_DB  , 'DB');
                    break;

                case 'wait':
                    if (isInit) {
                        this.left_tab_pnl.items.items[2].tab.setVisible(true);
                    }

                    push_list(this.IDXDB_WAIT, 'Wait');
                    break;

                case 'gc'  :
                    if (isInit) {
                        this.left_tab_pnl.items.items[3].tab.setVisible(true);
                    }

                    push_list(this.IDXDB_GC  , 'GC') ;
                    break;

                default:
                    break;
            }
        }
    },

    init_form: function() {

        this.IDXDB_STAT      = 'pa_' + this.view_name + '_stat';
        this.IDXDB_DB        = 'pa_' + this.view_name + '_db';
        this.IDXDB_WAIT      = 'pa_' + this.view_name + '_wait';
        this.IDXDB_GC        = 'pa_' + this.view_name + '_gc';
        this.IDXDB_LAST_TYPE = 'pa_' + this.view_name + '_last_type';
        this.IDXDB_TYPES     = 'pa_' + this.view_name + '_types';
        this.IDXDB_DEFAULT   = 'Default';

        //전체리스트관리하는 오브젝트
        this.defined_list = {};
        this.layout_main();

        this.last_type = Comm.web_env_info[this.IDXDB_LAST_TYPE];
        this.all_type  = Comm.web_env_info[this.IDXDB_TYPES].split(',');

        //가장마지막에 저장한 스탯리스트들.
        this.last_stat_list.Stat = Comm.web_env_info[this.IDXDB_STAT + '_' + this.last_type];
        this.last_stat_list.DB   = Comm.web_env_info[this.IDXDB_DB + '_' + this.last_type];
        this.last_stat_list.Wait = Comm.web_env_info[this.IDXDB_WAIT + '_' + this.last_type];
        this.last_stat_list.GC   = Comm.web_env_info[this.IDXDB_GC + '_' + this.last_type];

        this.last_stat_list_id.Stat = Comm.web_env_info[this.IDXDB_STAT + '_id_' + this.last_type];
        this.last_stat_list_id.DB   = Comm.web_env_info[this.IDXDB_DB + '_id_' + this.last_type];
        this.last_stat_list_id.Wait = Comm.web_env_info[this.IDXDB_WAIT + '_id_' + this.last_type];
        this.last_stat_list_id.GC   = Comm.web_env_info[this.IDXDB_GC + '_id_' + this.last_type];

        this.loadUserDefined(true);

        //왼쪽그리드 데이터 그리기
        //this.load_list_data()

        //오른쪽그리드 데이터 그리기
        this.stat_change.stat_data = this.total_stat_list;
        this.stat_change.init();
    } ,

    /*
     * 인덱스디비에 저장된 현재목록 불러와 좌측그리드(상,하)에 붙이기.
     * */
    load_list_data: function() {
        var ix, ixLen;

        // 하단 그리드 ADD
        this.list_grd.clearRows();
        for (ix = 0, ixLen = this.all_type.length; ix < ixLen; ix++) {
            this.list_grd.addRow([this.all_type[ix]]);
        }
        this.list_grd.drawGrid();
        this.type_field.setValue(this.last_type);


        this.list_grd.selectByValue('type', this.last_type);

        ix = null;
    } ,


    /*
     * +, - 버튼에 대한 정의 함수.
     * 중복처리등 검증처리만 하는 함수. -> true, false 리턴형 함수.
     * */
    is_validate: function(btn) {

        var self = this;
        var curr_type = common.Util.CTR( this.type_field.value),
            tempRecord, data, result = true,
            ix, ixLen, temp;

        // plus, minus 공통 검증.
        // 1.타입필드가 널인지 확인.
        if (curr_type == '' || curr_type == undefined) {
            common.Util.showMessage(common.Util.TR('OK'), common.Util.TR('Please enter your Stat'),
                Ext.Msg.OK, Ext.MessageBox.INFO, function() {
                    self.type_field.focus();
                });
            return false;
        }

        //2. default라는 이름을 추가도 삭제도 할수 X.
        if (curr_type == common.Util.CTR(this.IDXDB_DEFAULT)) {
            common.Util.showMessage(common.Util.TR('OK'), common.Util.TR('You cannot modify Default.'),
                Ext.Msg.OK, Ext.MessageBox.ERROR, null);
            return false;
        }

        if (btn.itemId == 'plus') {

            // 기존에 있는 type이면 OKCANCEL팝업.
            for (ix = 0, ixLen =  this.list_grd.getRowCount(); ix < ixLen; ix++) {
                data = this.list_grd.getRow(ix).data;
                temp = [];
                if (common.Util.CTR(data.type) == curr_type) {

                    self.plus_btn.setDisabled(true);
                    self.minus_btn.setDisabled(true);

                    //전체배열 재로드.
                    temp = self.defined_list[curr_type];
                    delete self.defined_list[curr_type]; // 바뀐 리스트로 갯수를 제한함
                    self.reload_obj(curr_type);

                    //갯수 제한
                    result = self.limit_count(curr_type);
                    if (!result) {
                        data = null;
                        self.defined_list[curr_type] = temp;
                        return false;
                    }

                    common.Util.showMessage(common.Util.TR('OK'), common.Util.TR('The name that is already saved. Do you want to continue?'),
                        Ext.Msg.OKCANCEL, Ext.MessageBox.INFO, function(buttonId) {
                            if (buttonId === 'ok') {
                            //그리드del -> Add.
                                self.list_grd.deleteRow(ix);
                                self.list_grd.addRow([curr_type]);
                                self.list_grd.drawGrid();
                                self.list_grd.selectByValue('type', curr_type);
                            } else {
                                data = null;
                                return false;
                            }
                        });
                    data = null;
                    return false;
                }
            }

            this.plus_btn.setDisabled(true);
            this.minus_btn.setDisabled(true);

            //전체배열 재로드.
            this.reload_obj(curr_type);

            //갯수 제한
            result = this.limit_count(curr_type);
            if (!result) {
                delete self.defined_list[curr_type];
                return false;
            }

            //그리드Add.
            this.list_grd.addRow([curr_type]);
            this.list_grd.drawGrid();
            this.list_grd.selectByValue('type', curr_type);

        } else {

            if (this.defined_list[curr_type]) {
                delete this.defined_list[curr_type];
                tempRecord = this.list_grd.findRow('type', curr_type);
                this.list_grd.deleteRecords([tempRecord]);
                this.list_grd.selectByValue('type', this.IDXDB_DEFAULT);
            }
        }

    },

    limit_count: function(curr_type) {

        var result = true;
        var ix, ixLen, checkCount;

        if (this.view_name.includes('_performance_trend_all')) {
            checkCount = 5;
        } else {
            checkCount = 4;
        }

        for (ix = 0, ixLen = this.visible_stat_list.length; ix < ixLen; ix++) {
            switch (this.visible_stat_list[ix]) {
                case 'stat':
                    if (this.defined_list[curr_type].Stat[3].length < checkCount || this.defined_list[curr_type].Stat[2].length < checkCount) {
                        result = false;
                    }
                    break;

                case 'db'  :
                    if (this.defined_list[curr_type].DB[3].length < checkCount || this.defined_list[curr_type].DB[2].length < checkCount) {
                        result = false;
                    }
                    break;

                case 'wait':
                    if (this.defined_list[curr_type].Wait[3].length < checkCount || this.defined_list[curr_type].Wait[2].length < checkCount) {
                        result = false;
                    }
                    break;

                case 'gc'  :
                    if (this.defined_list[curr_type].GC[3].length < checkCount || this.defined_list[curr_type].GC[2].length < checkCount) {
                        result = false;
                    }
                    break;
                default :
                    break;
            }

            if (!result) {
                // this.sync_tab(ix); return false 로 멈추면 싱크가 필요하지 않게되어 주석처리합니다.
                common.Util.showMessage(common.Util.TR('OK'), common.Util.TR('Stat count of tabs should be %1.', checkCount), Ext.Msg.OK, Ext.MessageBox.WARNING, null);
                return result;
            }
        }
        return result;

    },

    reload_obj: function(_curr_type) {

        var ix;
        var self = this, stat_name = '';

        if (this.defined_list[_curr_type] == undefined) {
            this.defined_list[_curr_type] = {
                'Stat': { 0: [], 1: [], 2: [], 3: [] },
                'DB'  : { 0: [], 1: [], 2: [], 3: [] },
                'Wait': { 0: [], 1: [], 2: [], 3: [] },
                'GC'  : { 0: [], 1: [], 2: [], 3: [] }
            };
        }

        var push_list = function(grd, key) {
            for (ix = 0; ix < grd.pnlExGrid.getStore().data.items.length; ix++) {
                stat_name = grd.pnlExGrid.getStore().data.items[ix];

                if (common.Util.CTR(stat_name.data[key]) == common.Util.CTR('CPU Usage')) {
                    stat_name.data[key] = 'CPU Usage';
                }
                if (stat_name.data[key + 'Name'] == undefined) {
                    stat_name.data[key + 'Name'] = stat_name.data.Index;
                }

                self.defined_list[ _curr_type ][ key ][0].push(stat_name.data[key]);
                self.defined_list[ _curr_type ][ key ][1].push(stat_name.data.type);
                self.defined_list[ _curr_type ][ key ][2].push(stat_name.data.Index);
                self.defined_list[ _curr_type ][ key ][3].push(stat_name.data[key + 'Name']);

            }
        };


        //호출
        push_list(this.curr_stat_grd, 'Stat');
        push_list(this.curr_db_grd  , 'DB');
        push_list(this.curr_wait_grd, 'Wait');
        push_list(this.curr_gc_grd  , 'GC');

        this.plus_btn.setDisabled(false);
        this.minus_btn.setDisabled(false);
        ix = null;
        stat_name = null;
        self = null;
    } ,

    /*
     * <, > ▲,▼ 네개버튼에 대한 정의 함수.
     * btn - 네개버튼의 itemId.
     * */
    set_stat: function(btn) {

        var left_tab_type  = this.left_tab_pnl.getActiveTab().title,
            right_tab_type = this.stat_change.getActiveTab().title,
            curr_grd, stat_change_grd, stat_cnt,
            select_value, select_row, select_pos, stat_index,
            checkCount, currTypeName,
            dup_str, ix, ixLen;


        switch (right_tab_type) {
            case common.Util.TR('Agent Stat'):
                stat_change_grd = this.stat_change.statTabGrid;
                break;

            case common.Util.TR('DB Stat'):
                stat_change_grd = this.stat_change.dbTabGrid;
                break;

            case common.Util.TR('DB Wait'):
                stat_change_grd = this.stat_change.waitTabGrid;
                break;

            case common.Util.TR('GC Stat'):
                stat_change_grd = this.stat_change.gcTabGrid;
                break;

            default :
                break;
        }

        switch (left_tab_type) {
            case common.Util.TR('Agent Stat'):
                curr_grd = this.curr_stat_grd;
                currTypeName = 'StatName';
                break;

            case common.Util.TR('DB Stat'):
                curr_grd = this.curr_db_grd;
                currTypeName = 'DBName';
                break;

            case common.Util.TR('DB Wait'):
                curr_grd = this.curr_wait_grd;
                currTypeName = 'WaitName';
                break;

            case common.Util.TR('GC Stat'):
                curr_grd = this.curr_gc_grd;
                currTypeName = 'GCName';
                break;

            default :
                break;
        }
        stat_cnt = curr_grd.pnlExGrid.getStore().data.length;

        if (this.view_name.includes('_performance_trend_all')) {
            checkCount = 5;
        } else {
            checkCount = 4;
        }

        //1. add
        if (btn.itemId == 'add') {

            //1-0 선택됐는지 체크.
            select_row   = stat_change_grd.getSelectionModel().getSelection()[0];
            if (select_row == undefined) {
                common.Util.showMessage(common.Util.TR('OK'), common.Util.TR('Choose to move the row.'),
                    Ext.Msg.OK, Ext.MessageBox.WARNING, function() {

                    });
                return;
            }
            select_value = stat_change_grd.getStore().findRecord('name', select_row.data.name);


            //1-1 4개초과시 팝업.
            if (!(stat_cnt < checkCount)) {
                common.Util.showMessage(common.Util.TR('OK'), common.Util.TR('Stat count of tabs should be %1.', checkCount),
                    Ext.Msg.OK, Ext.MessageBox.WARNING, function() {

                    });
                return;
            }


            //1-2 이미 안에 있다면 중복팝업.
            for (ix = 0, ixLen = curr_grd.pnlExGrid.getStore().data.length; ix < ixLen; ix++) {
                dup_str = common.Util.CTR(curr_grd.pnlExGrid.getStore().data.items[ix].data[currTypeName]);

                if (dup_str == common.Util.CTR(select_value.data.name)) {
                    common.Util.showMessage(common.Util.TR('OK'), common.Util.TR('Already exists'),
                        Ext.Msg.OK, Ext.MessageBox.ERROR, null);
                    return;
                }
            }
            stat_index = select_row.data._id == undefined ? select_row.data.name : select_row.data._id;
            curr_grd.addRow([select_row.data.name, right_tab_type, stat_index, select_value.data._name]);
            curr_grd.drawGrid();

            ix = null;
            dup_str = null;
            stat_index = null;

        }

        //2. remove
        //2-0 선택됐는지 체크.
        //1-0 선택됐는지 체크.
        if (btn.itemId == 'remove') {
            select_row   = curr_grd.pnlExGrid.getSelectionModel().getSelection()[0];
            if (select_row == undefined) {
                common.Util.showMessage(common.Util.TR('OK'), common.Util.TR('Choose to move the row.'),
                    Ext.Msg.OK, Ext.MessageBox.WARNING, function() {

                    });
                return;
            }
            select_pos = curr_grd.pnlExGrid.store.indexOf(select_row);
            curr_grd.deleteRow(select_pos);
            curr_grd.drawGrid();
            curr_grd.pnlExGrid.getSelectionModel().select(0); //0번째 자동선택.
        }

        if (btn.itemId == 'up') {

            select_row = curr_grd.pnlExGrid.getSelectionModel().getSelection()[0];
            if (select_row == undefined) {
                common.Util.showMessage(common.Util.TR('OK'), common.Util.TR('Choose to move the row.'),
                    Ext.Msg.OK, Ext.MessageBox.WARNING, null);
                return;
            }

            select_pos = curr_grd.pnlExGrid.store.indexOf(select_row);
            if (select_pos == 0) {
                return;
            }

            curr_grd.deleteRow(select_pos);
            curr_grd.insertRow(select_pos - 1, [
                select_row.data[curr_grd.itemId]
                , curr_grd.itemId
                , select_row.data.Index
                , select_row.data[curr_grd.itemId + 'Name'] == undefined ? select_row.data.Index : select_row.data[curr_grd.itemId + 'Name']
            ]);
            curr_grd.drawGrid();
            curr_grd.pnlExGrid.getSelectionModel().select(curr_grd.pnlExGrid.getStore().getAt(select_pos - 1));

        } else if ( btn.itemId == 'down' ) {

            select_row   = curr_grd.pnlExGrid.getSelectionModel().getSelection()[0];
            if (select_row == undefined) {
                common.Util.showMessage(common.Util.TR('OK'), common.Util.TR('Choose to move the row.'),
                    Ext.Msg.OK, Ext.MessageBox.WARNING, function() {

                    });
                return;
            }

            select_pos = curr_grd.pnlExGrid.store.indexOf(select_row);
            if (select_pos == 3) {
                return;
            }
            curr_grd.deleteRow(select_pos);
            curr_grd.insertRow(select_pos + 1, [
                select_row.data[ curr_grd.itemId ]
                , curr_grd.itemId
                , select_row.data.Index
                , select_row.data[curr_grd.itemId + 'Name'] == undefined ? select_row.data.Index : select_row.data[curr_grd.itemId + 'Name']
            ]);
            curr_grd.drawGrid();
            curr_grd.pnlExGrid.getSelectionModel().select(curr_grd.pnlExGrid.getStore().getAt(select_pos + 1));

        }

        curr_grd = null;
        stat_change_grd = null;
        stat_cnt = null;
        select_value = null;
        select_row = null;
    },

    save_db: function() {

        //types
        var ix, ixLen, jx, jxLen;
        var types = '';
        var userDefine;
        var userDefineList = Object.keys(this.defined_list);
        var charts, selectedStatList, selectedAliasList, tabItems, tabName, sumLiteral, active_pnl,
            kx, kxLen;

        //1. web env 저장
        this.last_type = this.lastSelectValue;

        //last_type
        common.WebEnv.rewrite_config(this.IDXDB_LAST_TYPE , this.last_type);
        common.WebEnv.Save(this.IDXDB_LAST_TYPE , this.last_type);

        for (ix = 0, ixLen = userDefineList.length; ix < ixLen; ix++) {
            userDefine = userDefineList[ix];
            types += userDefine + ',';
            //그외값들

            for (kx = 0, kxLen = this.visible_stat_list.length; kx < kxLen; kx++) {

                switch (this.visible_stat_list[kx]) {

                    case 'stat':
                        common.WebEnv.rewrite_config(this.IDXDB_STAT + '_' + userDefine, this.defined_list[userDefine].Stat[3]);
                        common.WebEnv.rewrite_config(this.IDXDB_STAT + '_id_' + userDefine, this.defined_list[userDefine].Stat[2]);
                        common.WebEnv.Save(this.IDXDB_STAT + '_' + userDefine, this.defined_list[userDefine].Stat[3]);
                        common.WebEnv.Save(this.IDXDB_STAT + '_id_' + userDefine, this.defined_list[userDefine].Stat[2]);

                        this.last_stat_list.Stat = Comm.web_env_info[this.IDXDB_STAT + '_' + this.last_type];
                        this.last_stat_list_id.Stat = Comm.web_env_info[this.IDXDB_STAT + '_id_' + this.last_type];

                        break;
                    case 'db'  :
                        common.WebEnv.rewrite_config(this.IDXDB_DB + '_' + userDefine, this.defined_list[userDefine].DB[3]);
                        common.WebEnv.rewrite_config(this.IDXDB_DB + '_id_' + userDefine, this.defined_list[userDefine].DB[2]);
                        common.WebEnv.Save(this.IDXDB_DB + '_' + userDefine, this.defined_list[userDefine].DB[3]);
                        common.WebEnv.Save(this.IDXDB_DB + '_id_' + userDefine, this.defined_list[userDefine].DB[2]);

                        this.last_stat_list.DB    = Comm.web_env_info[this.IDXDB_DB + '_' + this.last_type];
                        this.last_stat_list_id.DB = Comm.web_env_info[this.IDXDB_DB + '_id_' + this.last_type];

                        break;
                    case 'wait':
                        common.WebEnv.rewrite_config(this.IDXDB_WAIT + '_' + userDefine, this.defined_list[userDefine].Wait[3]);
                        common.WebEnv.rewrite_config(this.IDXDB_WAIT + '_id_' + userDefine, this.defined_list[userDefine].Wait[2]);
                        common.WebEnv.Save(this.IDXDB_WAIT + '_' + userDefine, this.defined_list[userDefine].Wait[3]);
                        common.WebEnv.Save(this.IDXDB_WAIT + '_id_' + userDefine, this.defined_list[userDefine].Wait[2]);

                        this.last_stat_list.Wait    = Comm.web_env_info[this.IDXDB_WAIT + '_' + this.last_type];
                        this.last_stat_list_id.Wait = Comm.web_env_info[this.IDXDB_WAIT + '_id_' + this.last_type];

                        break;
                    case 'gc'  :
                        common.WebEnv.rewrite_config(this.IDXDB_GC + '_' + userDefine, this.defined_list[userDefine].GC[3]);
                        common.WebEnv.rewrite_config(this.IDXDB_GC + '_id_' + userDefine, this.defined_list[userDefine].GC[2]);
                        common.WebEnv.Save(this.IDXDB_GC + '_' + userDefine, this.defined_list[userDefine].GC[3]);
                        common.WebEnv.Save(this.IDXDB_GC + '_id_' + userDefine, this.defined_list[userDefine].GC[2]);

                        this.last_stat_list.GC    = Comm.web_env_info[this.IDXDB_GC + '_' + this.last_type];
                        this.last_stat_list_id.GC = Comm.web_env_info[this.IDXDB_GC + '_id_' + this.last_type];

                        break;
                    default:
                        break;
                }
            }
        }

        types = types.substring(0, types.length - 1);
        common.WebEnv.rewrite_config( this.IDXDB_TYPES , types );
        common.WebEnv.Save( this.IDXDB_TYPES , types );
        this.all_type  = Comm.web_env_info[this.IDXDB_TYPES].split(',');

        if (this.view_name == 'performance_trend') {

            //title_update
            this.scope.pnl_stat.loadingMask.show();
            this.scope.pnl_db  .loadingMask.show();
            this.scope.pnl_wait.loadingMask.show();
            this.scope.pnl_gc  .loadingMask.show();

            this.scope.title_update(this.scope.arr_stat_chart , this.last_stat_list.Stat);
            this.scope.title_update(this.scope.arr_db_chart   , this.last_stat_list.DB  );
            this.scope.title_update(this.scope.arr_wait_chart , this.last_stat_list.Wait);
            this.scope.title_update(this.scope.arr_gc_chart   , this.last_stat_list.GC  );

            if (!this.flag_refresh) {
                this.scope.pnl_stat.loadingMask.hide();
                this.scope.pnl_db.loadingMask.hide();
                this.scope.pnl_wait.loadingMask.hide();
                this.scope.pnl_gc.loadingMask.hide();
                return;
            }

            this.scope.get_mid_chart(this.curr_active_tab.itemId);
            this.scope.pnl_stat.loadingMask.hide();
            this.scope.pnl_db.loadingMask.hide();
            this.scope.pnl_wait.loadingMask.hide();
            this.scope.pnl_gc.loadingMask.hide();

        } else if (this.view_name == 'tp_performance_trend' || this.view_name == 'tux_performance_trend' || this.view_name == 'web_performance_trend' || this.view_name == 'cd_performance_trend') {
            selectedStatList = this.last_stat_list.Stat;
            selectedAliasList = this.last_stat_list_id.Stat;
            charts = this.scope.chartList[this.scope.midPanel.getActiveTab().title];
            for (ix = 0, ixLen = charts.length; ix < ixLen; ix++) {
                charts[ix].setTitle(common.Util.TR(selectedStatList[ix]));
                charts[ix].alias = selectedAliasList[ix];

                charts[ix].removeAllSeries();

                sumLiteral = '_sum';

                if (selectedAliasList[ix].indexOf(sumLiteral) === -1) {
                    charts[ix].addSeries({
                        label: common.Util.CTR('MAX'),
                        id   : 'max',
                        type : PlotChart.type.exLine
                    });

                    charts[ix].addSeries({
                        label: common.Util.CTR('AVG'),
                        id   : 'avg',
                        type : PlotChart.type.exLine
                    });
                } else {
                    charts[ix].addSeries({
                        label: common.Util.CTR('SUM'),
                        id   : 'sum',
                        type : PlotChart.type.exLine
                    });
                }
            }

            if (this.scope.indicatorTime !== undefined) {
                this.scope.executeMidSQL();
            }
        } else if (this.view_name.includes('_performance_trend_all')) {
            tabItems = this.scope.tabPanel.items.items;
            for (ix = 0, ixLen = tabItems.length; ix < ixLen; ix++) {
                tabName = tabItems[ix].title;
                if (tabName === common.Util.TR('Agent Stat')) {
                    selectedStatList = this.last_stat_list.Stat;
                    selectedAliasList = this.last_stat_list_id.Stat;
                } else if (tabName === common.Util.TR('GC Stat')) {
                    selectedStatList = this.last_stat_list.GC;
                    selectedAliasList = this.last_stat_list_id.GC;
                }

                charts = this.scope.chartList[tabName];

                if (charts.length !== selectedStatList.length) {
                    return;
                }

                for (jx = 0, jxLen = charts.length; jx < jxLen; jx++) {
                    charts[jx].setTitle(common.Util.TR(selectedStatList[jx]));
                    charts[jx].statName = selectedAliasList[jx];
                }
            }

            if (this.scope.indicatorTime !== undefined) {
                this.scope.executeSQL();
                this.scope.isChangeStat = true;
            }
        } else {
            //comparison
            active_pnl = this.scope.workArea.getComponent('mid_tab').getComponent(this.curr_active_tab.itemId);
            active_pnl.loadingMask.show();

            this.scope.title_update(this.scope.array_chart.Agent, this.last_stat_list.Stat, this.last_stat_list_id.Stat);
            if (this.view_name !== 'web_comparison' && this.view_name !== 'cd_comparison') {
                this.scope.title_update(this.scope.array_chart.GC, this.last_stat_list.GC, this.last_stat_list_id.GC);
            }

            if (!this.flag_refresh) {
                active_pnl.loadingMask.hide();
                return;
            }

            this.scope.get_chart_data(active_pnl.itemId);

            active_pnl.loadingMask.hide();
            active_pnl = null;
        }

        return true;

    },



    layout_main: function() {
        var self = this;

        //main
        this.main_pnl = Ext.create( 'Exem.Panel', {
            layout: 'hbox',
            width : '100%',
            flex  : 11,
            style : {
                borderRadius: '6px 6px 0px 0px'
            }
        } );

        var main_btn = Ext.create( 'Exem.Container', {
            itemId: 'main_pnl',
            layout: {
                type : 'vbox',
                align: 'middle',
                pack : 'center'
            },
            width : '100%',
            flex  : 1,
            style : {
                background: '#fff',
                borderRadius: '0px 0px 6px 6px'
            }
        } );


        var okBtn = Ext.create('Ext.container.Container',{
            html   : common.Util.TR('OK'),
            height : 25,
            width  : 55,
            margin : '0 5 0 0',
            cls    : 'stat_change_b',
            listeners: {
                render: function() {
                    this.getEl().on('click', function() {
                        self.save_db();
                        self.close();
                    });
                }
            }
        });


        var cancelBtn = Ext.create('Ext.container.Container', {
            html   : common.Util.TR('Cancel'),
            height : 25,
            width  : 55,
            margin : '0 5 0 0',
            cls    : 'stat_change_b',
            listeners: {
                render: function() {
                    this.getEl().on('click', function() {
                        self.defined_list = {};
                        self.loadUserDefined(false);
                        self.close();
                    });
                }
            }
        });

        var bottomArea = Ext.create('Exem.Container', {
            width : '100%',
            //margin: '10 0 0 0',
            height: 25,
            layout: {
                type : 'hbox',
                align: 'middle',
                pack: 'center'
            },
            style : 'background: #ffffff',
            items : [ okBtn,{ xtype:'tbspacer', width: 3 }, cancelBtn ]
        });
        main_btn.add(bottomArea);

        var layout_hbox_pnl = function(pnl_id, layout) {
            var pnl = Ext.create('Exem.Container', {
                itemId : pnl_id,
                layout : layout,
                flex   : 1
            });
            return pnl;
        };
        var left_pnl  = layout_hbox_pnl('left_pnl', 'vbox');
        var right_pnl = layout_hbox_pnl('right_pnl', 'vbox');

        this.add(this.main_pnl, main_btn);
        this.main_pnl.add(left_pnl, right_pnl);


        //*******************************************************************
        //left layout
        var layout_left_pnl = function(pnl_id, size, layout_type) {

            var pnl = Ext.create('Exem.Panel', {
                itemId: pnl_id,
                layout: layout_type,
                width : '100%',
                flex  : size
            });

            if (pnl_id == 'left_in_text') {
                self.type_field = Ext.create('Ext.form.field.Text', {
                    width: 230,
                    margin: '7 0 0 0'
                });
                self.plus_btn = Ext.create('Ext.button.Button', {
                    text  : '+',
                    itemId: 'plus',
                    width : 28,
                    margin: '7 3 0 3',
                    listeners:{
                        click: function() {
                            //validate
                            self.is_validate(this);
                        }
                    }
                });
                self.minus_btn = Ext.create('Ext.button.Button', {
                    text  : '-',
                    itemId: 'minus',
                    width : 28,
                    margin: '7 3 0 0',
                    listeners:{
                        click: function() {
                            self.is_validate(this);
                        }
                    }
                });
                pnl.add(self.type_field, self.plus_btn, self.minus_btn);
            }
            return pnl;
        };
        var left_in_pnl  = layout_left_pnl('left_in_pnl' , 5 , 'hbox'),
            left_in_text = layout_left_pnl('left_in_text', 1 , 'hbox'),
            left_in_list = layout_left_pnl('left_in_list', 3 , 'hbox');


        //left tab panel
        this.left_tab_pnl = Ext.create('Exem.TabPanel', {
            itemId: 'left_tab_pnl',
            layout: 'fit',
            height: '100%',
            flex : 8,
            activeTab: 0,
            items: [{ title: common.Util.TR('Agent Stat'), layout: 'fit', tab_idx: 0 }
                ,{ title: common.Util.TR('DB Stat'), layout: 'fit', tab_idx: 1 }
                ,{ title: common.Util.TR('DB Wait'), layout: 'fit', tab_idx: 2 }
                ,{ title: common.Util.TR('GC Stat'), layout: 'fit', tab_idx: 3 }] ,
            listeners:{
                tabchange: function(tabPanel, newCard) {
                    self.sync_tab(newCard.tab_idx);
                }
            }
        });
        var left_btn_pnl = Ext.create('Exem.Container', {
            layout: { type: 'vbox', align: 'center', pack: 'center' },
            flex  : 1
        });
        left_in_pnl.add(this.left_tab_pnl, left_btn_pnl);
        left_pnl.add(left_in_pnl, left_in_text, left_in_list);

        //left_in_panel in Grid
        this.curr_stat_grd  = Ext.create('Exem.BaseGrid',{ usePager: false, hideGridHeader: true, adjustGrid: true, itemId: 'Stat'  });
        this.curr_db_grd    = Ext.create('Exem.BaseGrid',{ usePager: false, hideGridHeader: true, adjustGrid: true, itemId: 'DB'    });
        this.curr_wait_grd  = Ext.create('Exem.BaseGrid',{ usePager: false, hideGridHeader: true, adjustGrid: true, itemId: 'Wait'  });
        this.curr_gc_grd    = Ext.create('Exem.BaseGrid',{ usePager: false, hideGridHeader: true, adjustGrid: true, itemId: 'GC'    });
        this.left_tab_pnl.items.items[0].add(self.curr_stat_grd);
        this.left_tab_pnl.items.items[1].add(self.curr_db_grd);
        this.left_tab_pnl.items.items[2].add(self.curr_wait_grd);
        this.left_tab_pnl.items.items[3].add(self.curr_gc_grd);

        //처음은 visible = false로 하고 push_list할때 true하는걸로.
        this.left_tab_pnl.items.items[0].tab.setVisible(false);
        this.left_tab_pnl.items.items[1].tab.setVisible(false);
        this.left_tab_pnl.items.items[2].tab.setVisible(false);
        this.left_tab_pnl.items.items[3].tab.setVisible(false);

        this.curr_stat_grd.addColumn('Stat' , 'Stat'    , 200, Grid.String, true, false); //TR로 변환된 스탯명
        this.curr_stat_grd.addColumn('Type' , 'type'    , 200, Grid.String, false, true); //타입(stat,db..)
        this.curr_stat_grd.addColumn('Index', 'Index'   , 300, Grid.String, false, true); //스탯아이디
        this.curr_stat_grd.addColumn('Stat' , 'StatName', 300, Grid.String, false, true); //영문스탯명

        this.curr_gc_grd  .addColumn('GC'   , 'GC'      , 300, Grid.String, true, false);
        this.curr_gc_grd  .addColumn('Type' , 'type'    , 200, Grid.String, false, true);
        this.curr_gc_grd  .addColumn('Index', 'Index'   , 300, Grid.String, false, true);
        this.curr_gc_grd  .addColumn('GC'   , 'GCName'  , 300, Grid.String, false, true);

        this.curr_db_grd  .addColumn('DB'   , 'DB'      , 300, Grid.String, true, false);
        this.curr_db_grd  .addColumn('Type' , 'type'    , 200, Grid.String, false, true);
        this.curr_db_grd  .addColumn('Index', 'Index'   , 300, Grid.String, false, true);
        this.curr_db_grd  .addColumn('DB'   , 'DBName'  , 300, Grid.String, false, true);

        this.curr_wait_grd.addColumn('Wait' , 'Wait'    , 300, Grid.String, true, false);
        this.curr_wait_grd.addColumn('Type' , 'type'    , 200, Grid.String, false, true);
        this.curr_wait_grd.addColumn('Index', 'Index'   , 300, Grid.String, false, true);
        this.curr_wait_grd.addColumn('Wait' , 'WaitName', 300, Grid.String, false, true);

        this.list_grd = Ext.create('Exem.adminGrid', {
            width       : '100%',
            border      : false,
            editMode    : false,
            useCheckBox : true,
            checkMode   : Grid.checkMode.SINGLE,
            rowNumber   : false,
            usePager    : false,
            hideGridHeader : true,
            checkSelect: function() {
                var currSelectName = self.list_grd.baseGrid.getSelection()[0].data.type;
                self.lastSelectValue = currSelectName;

                var add_list = function(grd, key) {

                    grd.clearRows();

                    var curr_type = self.list_grd.baseGrid.getSelection()[0].data.type;
                    var change_value, ix, ixLen;
                    for (ix = 0, ixLen = self.defined_list[curr_type][key][0].length; ix < ixLen; ix++ ) {
                        if (common.Util.CTR(self.defined_list[curr_type][key][0][ix]) == common.Util.CTR('CPU Usage')) {
                            change_value = self.defined_list[curr_type][key][3][ix];
                        } else {
                            change_value = common.Util.CTR(self.defined_list[curr_type][key][0][ix]);
                        }

                        grd.addRow([
                            change_value
                            ,self.defined_list[curr_type][key][1][ix]
                            ,self.defined_list[curr_type][key][2][ix]
                            ,self.defined_list[curr_type][key][3][ix]
                        ]);

                    }
                    grd.drawGrid();
                    ix           = null;
                    curr_type    = null;
                    change_value = null;
                };

                var kx, kxLen;
                for (kx = 0, kxLen = self.visible_stat_list.length; kx < kxLen; kx++ ) {

                    //1. 상단 그리드 ADD Call.
                    switch (self.visible_stat_list[kx]) {

                        case 'stat':
                            add_list(self.curr_stat_grd, 'Stat');
                            break;
                        case 'db'  :
                            add_list(self.curr_db_grd  , 'DB');
                            break;
                        case 'wait':
                            add_list(self.curr_wait_grd, 'Wait');
                            break;
                        case 'gc'  :
                            add_list(self.curr_gc_grd  , 'GC');
                            break;
                        default:
                            break;
                    }
                }
                kx = null;

                self.type_field.setValue(currSelectName);
            }
        });
        left_in_list.add(this.list_grd);
        this.list_grd.beginAddColumns();
        this.list_grd.addColumn({text: 'type', dataIndex: 'type', width: '100%', type: Grid.String, alowEdit: false, editMode: false});
        this.list_grd.endAddColumns();


        //left button
        var create_btn = function(_cls, _id) {
            var button = Ext.create('Ext.button.Button',{
                itemId : _id,
                width  : 30,
                margin : '0 0 3 0',
                iconCls: _cls,
                listeners: {
                    click: function(_this) {
                        self.set_stat(_this);
                    }
                }
            });
            return button;
        };
        this.add_btn    = create_btn('arrow_add'   , 'add');
        this.remove_btn = create_btn('arrow_remove', 'remove');
        this.up_btn     = create_btn('arrow_up'    , 'up');
        this.down_btn   = create_btn('arrow_down'  , 'down');

        left_btn_pnl.add(self.add_btn, self.remove_btn, self.up_btn, self.down_btn);

        //*******************************************************************
        //right layout
        this.stat_change = Ext.create('view.PerformanceTrendStatChange', {
            instanceId: self.db_id,
            flex : 1,
            useTab: {
                stat   : true,
                db     : self.db_visible,
                wait   : self.wait_visible,
                gc     : self.gc_visible !== undefined ? self.gc_visible : true,
                pool   : false
            },
            useCheckBox: false

        });
        right_pnl.add(this.stat_change);
    },


    sync_tab: function(idx) {
        this.left_tab_pnl.setActiveTab(idx);
        this.stat_change.setActiveTab(idx);
    }

});