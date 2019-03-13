Ext.define('common.WebEnv', {
    singleton : true,

    init: function(){
        this.IDXDB_DEFAULT   = 'Default' ;
        this.IDXDB_STAT      = 'pa_performance_trend_stat';
        this.IDXDB_DB        = 'pa_performance_trend_db';
        this.IDXDB_WAIT      = 'pa_performance_trend_wait';
        this.IDXDB_GC        = 'pa_performance_trend_gc';
        this.IDXDB_LAST_TYPE = 'pa_last_type';
        this.IDXDB_TYPES     = 'pa_types';


        /** 사용하지 않는 파라미터 해당 파라미터들 보니깐 var를 통한 로컬 사용중임.
        this.default_stat = [    common.Util.CTR('Concurrent Users')
            ,common.Util.CTR('Active Users')
            ,common.Util.CTR('TPS')
            ,common.Util.CTR('Elapsed Time')
        ];

        this.default_stat_id = [  'was_sessions'
            ,'active_client_ip'
            ,'tps'
            ,'txn_elapse'
        ];

        this.default_gc  = [  common.Util.CTR('Total GC Count')
            ,common.Util.CTR('Total GC Time (Sec)')
            ,common.Util.CTR('Full GC Count')
            ,common.Util.CTR('Full GC Time (Sec)')
        ];

        this.default_gc_id = [   'jvm_gc_count'
            ,'jvm_gc_time'
            ,'ygc'
            ,'eden_gc_time'
        ];
         */

        this.default_db = [  'active sessions'
            ,'CPU Usage'
            ,'physical reads'
            ,'execute count'
        ];

        this.default_wait = [ 'Latch Wait Time (Total)'
            ,'db file sequential read'
            ,'db file scattered read'
            ,'library cache pin'
        ] ;


        //db trend var
        this.IDXDB_DB_STAT    = 'pa_db_trend_stat';
        this.IDXDB_DB_WAIT    = 'pa_db_trend_wait';
        this.IDXDB_DB_RATIO   = 'pa_db_trend_ratio';

        /** 사용되지 않고 있는 파라미터
        this.default_db_stat = [ 'session logical reads'
            , 'physical reads'
            , 'execute count'
            , 'redo entries'
        ] ;

        this.default_db_wait = [ 'Latch Wait Time (Total)'
            , 'db file sequential read'
            , 'db file scattered read'
            , 'library cache pin'
        ] ;

        this.default_db_ratio =  [ 'Buffer Cache Hit Ratio'
            , 'Log Buffer Retry Ratio'
            , 'Log Space Request Ratio'
            , 'Free Buffer Scan Ratio'
        ] ;

        this.array_stat = [] ;
        this.array_stat_id = [] ;
         */

        // WebEnv 데이터가 로드되었는지 유무를 체크하는 구분 값
        this.isLoadWebEnvData = false;

        this.get_all_data();
    },


    /**
     * WebEnv에 들어가는 데이터 가져오기
     */
    get_all_data: function(){
        WS.SQLExec({
            sql_file: 'IMXPA_WebEnv_GridName.sql',
            bind   : [{
                name : 'user_id',
                value: Comm.web_env_info['user_id'],
                type : SQLBindType.INTEGER
            }],
            //database: Comm.currentRepositoryInfo.database_name
            database: common.Util.getDefaultDatabaseName()
        }, this.on_grid_data.bind({scope: this}) ) ;


        WS.SQLExec({
            sql_file: 'IMXPA_WebEnv_all_data.sql',
            bind   : [{
                name : 'user_id',
                value: Comm.web_env_info['user_id'],
                type : SQLBindType.INTEGER
            }],
            //database: Comm.currentRepositoryInfo.database_name
            database: common.Util.getDefaultDatabaseName()
        }, this.on_all_data.bind(this) ) ;
    },


    /**
     * Grid 저장 정보 가져오기
     *
     * @param {object} header
     * @param {object} data
     */
    on_grid_data: function( header, data ){
        if (!Comm.web_env_info['GridColumns']) {
            Comm.web_env_info['GridColumns'] = {};
        }

        if (!data.rows) {
            console.debug('%c No Data - Grid Columns Info', 'color:#0000FF;font-weight:bold;');

        } else {
            for (var ix = 0, ixLen = data.rows.length; ix < ixLen; ix++ ) {
                Comm.web_env_info['GridColumns'][data.rows[ix][1]] = [];
                Comm.web_env_info[['GridColumns']][data.rows[ix][1]] = JSON.parse(data.rows[ix][2])  ;

                Comm.web_env_info[data.rows[ix][1]] = data.rows[ix][2];
            }
        }
    },


    /**
     * Grid 정보 이외의 WebEnv 데이터 가져오기
     *
     * @param {object} header
     * @param {object} data
     */
    on_all_data: function( header, data ) {

        if (data.rows && data.rows.length > 0) {
            var ix, ixLen;
            var store_tmp, first_pos;

            for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++ ) {

                if (data.rows[ix][0].indexOf('pa_') === 0) {

                    if (data.rows[ix][0].match('GridName') != null) {
                        continue;
                    }

                    // []가있으면 split해서 저장.
                    store_tmp = data.rows[ix][1] ;
                    first_pos = store_tmp.indexOf('[') ;

                    if ( first_pos >= 0) {
                        try {
                            data.rows[ix][1] = JSON.parse( data.rows[ix][1] ) ;
                        } catch (e) {
                            console.debug(' [WebEnv] Parse Warning', e.message);
                        }
                    }
                }
                Comm.web_env_info[data.rows[ix][0]] = data.rows[ix][1];
            }

        } else {
            //self.get_type('pa_last_type') ;  //사용자가 마지막으로 선택한 type
        }

        this.isLoadWebEnvData = true;
    },


    /**
     * Performance Trend에서만 호출.
     * 처음에 pa 어떤 메뉴를 누르던 호출 됨.
     *
     * */

    /** 사용되지않고 있는 함수 주석처리.
    get_type: function(_key){
        WS.SQLExec({
            sql_file: 'IMXPA_WebEnv.sql',
            bind   : [   { name: 'user_id', value: Comm.web_env_info['user_id'], type: SQLBindType.INTEGER }
                         ,{ name: 'env_key', value: _key, type: SQLBindType.STRING }],
            //database: Comm.currentRepositoryInfo.database_name
            database: common.Util.getDefaultDatabaseName()
        }, this.on_config_last_type.bind({scope: this})) ;

    } ,


    on_config_last_type: function(header, data){
        var self = this.scope ;

        if ( data.rows.length == 0 ){
            self.insert_config( 'pa_last_type', self.IDXDB_DEFAULT ) ;
            self.insert_config( 'pa_types'    , self.IDXDB_DEFAULT ) ;

            //performance trend
            self.insert_config( self.IDXDB_STAT, JSON.stringify(self.default_stat ), self.IDXDB_DEFAULT ) ;
            self.insert_config( self.IDXDB_DB  , JSON.stringify(self.default_db   ), self.IDXDB_DEFAULT ) ;
            self.insert_config( self.IDXDB_WAIT, JSON.stringify(self.default_wait ), self.IDXDB_DEFAULT ) ;
            self.insert_config( self.IDXDB_GC  , JSON.stringify(self.default_gc   ), self.IDXDB_DEFAULT ) ;

            //db trend
            self.insert_config( self.IDXDB_STAT+'_id', JSON.stringify(self.default_stat_id ), self.IDXDB_DEFAULT ) ;
            self.insert_config( self.IDXDB_DB  +'_id', JSON.stringify(self.default_db      ), self.IDXDB_DEFAULT ) ;
            self.insert_config( self.IDXDB_WAIT+'_id', JSON.stringify(self.default_wait    ), self.IDXDB_DEFAULT ) ;
            self.insert_config( self.IDXDB_GC  +'_id', JSON.stringify(self.default_gc_id   ), self.IDXDB_DEFAULT ) ;
        }
    } ,
     */

    /*
     * stat id + name 저장
     * type값 저장 + last type값 저장
     * */
    del_config: function( _key, _type ){

        var key_val ;
        if ( _type == null ) {
            key_val = _key ;
        } else {
            key_val = _key+'_'+_type ;
        }

        WS.SQLExec({
            sql_file: 'IMXPA_WebEnv_delete.sql',
            bind    : [  { name: 'user_id'  , value: Comm.web_env_info['user_id'], type: SQLBindType.INTEGER }
                        ,{ name: 'env_key'  , value: key_val, type: SQLBindType.STRING }],
            //database: Comm.currentRepositoryInfo.database_name
            database: common.Util.getDefaultDatabaseName()
        }) ;

        Comm.web_env_info[ key_val ] = [] ;
        key_val = null ;
    } ,


    /*
     * stat id + name 저장
     * type값 저장 + last type값 저장
     *
     * */
    insert_config: function( _key, _value, _type ){

        var key_val ;
        if ( _type == null ) {
            key_val = _key ;
        } else {
            key_val = _key+'_'+_type ;
        }

        WS.SQLExec({
            sql_file: 'IMXPA_WebEnv_insert.sql',
            bind    : [{
                name: 'user_id'  , value: Comm.web_env_info['user_id'], type: SQLBindType.INTEGER
            }, {
                name: 'env_key'  , value: key_val, type: SQLBindType.STRING
            }, {
                name: 'env_value', value: _value, type: SQLBindType.STRING
            }],
            //database: Comm.currentRepositoryInfo.database_name
            database: common.Util.getDefaultDatabaseName()
        });

        Comm.web_env_info[ key_val ] = _value ;
        key_val = null;
    },


    /**
     * KEY,VALUE 삭제 및 추가(RTM,CONFIG)
     *
     * @param {string} _key
     * @param {string} _value
     */
    rewrite_config: function(_key, _value) {
        WS.SQLExec({
            sql_file: 'IMXRT_WebEnv_delinsert.sql',
            bind: [{
                name: 'user_id',
                type: SQLBindType.INTEGER,
                value: Comm.web_env_info['user_id']
            }, {
                name: 'env_key',
                type: SQLBindType.STRING,
                value: _key
            }, {
                name: 'env_value',
                type: SQLBindType.STRING,
                value: _value
            }],
            //database: Comm.currentRepositoryInfo.database_name
            database: common.Util.getDefaultDatabaseName()
        });

    },


    /**
     * 입력된 키값으로 WebEnv 데이터 저장하기
     *
     * @param {string} envKey
     * @param {string | null} envValue
     * @param {object} callFunc
     */
    Save: function(envKey, envValue, callFunc) {
        var dataSet  = {};

        dataSet.sql_file = 'IMXRT_WebEnv_delinsert.sql';
        dataSet.bind = [{
            name: 'user_id',
            type: SQLBindType.INTEGER,
            value: cfg.login.user_id
        }, {
            name: 'env_key',
            type: SQLBindType.STRING,
            value: envKey
        }, {
            name: 'env_value',
            type: SQLBindType.STRING,
            value: ((envValue != null)? envValue : null)
        }];

        if (callFunc) {
            callFunc(dataSet, null, this);

        } else {
            if(common.Util.isMultiRepository()){
                //dataSet.database = Comm.currentRepositoryInfo.database_name
                dataSet.database = common.Util.getDefaultDatabaseName();
            }

            WS.SQLExec(dataSet, function() {
                console.debug('%c [WebEnv] Save data.', 'color:#008000;');
            }, this);
        }

        Comm.web_env_info[ envKey ] = envValue ;
    },


    /**
     * 입력된 키 값 및 사용자 ID로 WebEnv 데이터 저장하기
     *
     * @param {string} envKey
     * @param {string | null} envValue
     * @param {string} userId
     * @param {object} callFunc
     */
    SaveByUserID: function(envKey, envValue, userId, callFunc) {
        var dataSet  = {};

        dataSet.sql_file = 'IMXRT_WebEnv_delinsert.sql';
        dataSet.bind = [{
            name: 'user_id',
            type: SQLBindType.INTEGER,
            value: userId
        }, {
            name: 'env_key',
            type: SQLBindType.STRING,
            value: envKey
        }, {
            name: 'env_value',
            type: SQLBindType.STRING,
            value: ((envValue != null)? envValue : null)
        }];

        if (callFunc) {
            callFunc(dataSet, null, this);

        } else {
            if(common.Util.isMultiRepository()){
                dataSet.database = common.Util.getDefaultDatabaseName();
            }

            WS.SQLExec(dataSet, function() {
                console.debug('%c [WebEnv] Save data.', 'color:#008000;');
            }, this);
        }

        Comm.web_env_info[ envKey ] = envValue ;
    },


    /**
     * 키값에 해당하는 WebEnv 데이터 가져오기
     *
     * @param {object} envKey
     * @param {object} callback
     */
    Load: function(envKey, callback) {
        var callFn = callback;

        setTimeout(function() {
            WS.SQLExec({
                sql_file: 'IMXPA_WebEnv.sql',
                bind: [{
                    name: 'user_id',
                    type: SQLBindType.INTEGER,
                    value: cfg.login.user_id
                }, {
                    name: 'env_key',
                    type: SQLBindType.STRING,
                    value: envKey
                }],
                //database: Comm.currentRepositoryInfo.database_name
                database: common.Util.getDefaultDatabaseName()
            }, function(aheader, adata) {
                if (!adata || !adata.rows || adata.rows.length === 0) {
                    callFn(null);
                } else {
                    callFn(adata.rows[0][0]);
                }
            }, this);
        }, 200);

        callFn = null;
    },

    set_nondb: function(grd_obj, flag) {

        if ( !window.isIMXNonDB ) {
            grd_obj.down('[dataIndex = cpu_time]').show() ;
            grd_obj.down('[dataIndex = wait_time]').show() ;
            grd_obj.down('[dataIndex = logical_reads]').show() ;
            grd_obj.down('[dataIndex = physical_reads]').show() ;

            grd_obj.down('[dataIndex = cpu_time]').columnHide = false ;
            grd_obj.down('[dataIndex = wait_time]').columnHide = false ;
            grd_obj.down('[dataIndex = logical_reads]').columnHide = false ;
            grd_obj.down('[dataIndex = physical_reads]').columnHide = false ;

            if ( flag ){
                grd_obj.down('[dataIndex = wait_info]').show() ;
                grd_obj.down('[dataIndex = mem_usage]').show() ;

                grd_obj.down('[dataIndex = wait_info]').columnHide = false ;
                grd_obj.down('[dataIndex = mem_usage]').columnHide = false ;
            }

        } else {
            grd_obj.down('[dataIndex = cpu_time]').hide() ;
            grd_obj.down('[dataIndex = wait_time]').hide() ;
            grd_obj.down('[dataIndex = logical_reads]').hide() ;
            grd_obj.down('[dataIndex = physical_reads]').hide() ;

            grd_obj.down('[dataIndex = cpu_time]').columnHide = true ;
            grd_obj.down('[dataIndex = wait_time]').columnHide = true ;
            grd_obj.down('[dataIndex = logical_reads]').columnHide = true ;
            grd_obj.down('[dataIndex = physical_reads]').columnHide = true ;

            if ( flag ){
                grd_obj.down('[dataIndex = wait_info]').hide() ;
                grd_obj.down('[dataIndex = mem_usage]').hide() ;

                grd_obj.down('[dataIndex = wait_info]').columnHide = true ;
                grd_obj.down('[dataIndex = mem_usage]').columnHide = true ;
            }
        }
    },

    setVisibleGridColumn: function(gridObj, names, isHide) {
        for (var ix = 0, ixLen = names.length; ix < ixLen; ix++) {
            if (isHide === true ) {
                gridObj.down('[dataIndex = ' + names[ix] + ']').hide();
                gridObj.down('[dataIndex = ' + names[ix] + ']').columnHide = true;
            }
        }

        gridObj = null;
        names   = null;
    }

});