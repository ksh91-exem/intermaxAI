IMXFN = {
		socket : {
			open : function(ip, port){
				var AConn = new IMXWS();
				AConn.parseJSON = true;

				// 접속할 WebSocket IP
				AConn.Host = ip;
				// 접속할 WebSocket Port
				AConn.Port = port;
				// push 성 data 를 받도록 한다. 반대는 PushDataOff
				AConn.extractheader = false;
				AConn.Open();
				return AConn;
			}
		},
		pair : {
			txn_detail_drag : ['was_id'],
			txn_detail_drag_maximum : ['was_id'],
			txn_detail_drag_sql_chart : ['was_id'],
			txn_detail_drag_sql_grid : ['was_id'],
			txn_detail_active : ['was_id'],
			txn_detail_chart_drag : ['was_id'],
			IMXPA_TopTransaction_grid : ['was_id'],
			IMXPA_TopTransaction_SelectGrid : ['was_id'],
			IMXPA_TopTransaction_SelectChart : ['was_id'],
			IMXPA_TOPSQL_elapse_exec : ['was_id'],
			IMXPA_AlertHistory_test : ['time_unit']

		},
		paramConvert : function(obj){
			var result = [];
			for(var key  in obj){
				result.push(key);
				result.push(obj[key]);
			}
			return result;
		},
		paramConvertType : function(obj){
			var result = [];
			for(var key  in obj){
				result.push(key);
				for(var i = 0 ;i < obj[key].length; i++){
					result.push(obj[key][i]);
				}
			}
			return result;
		},
		execParam : function(ws, fn, param, type){
			var t = type || 0;
			if(ws && ws.OPEN){
				var pair = IMXFN.pair
				, tmp = pair[fn]
				, relp_array = []
				, idx = 0, i = 0;
				if(tmp){
					for(i ; i < tmp.length; i++){
						idx = _.indexOf(param, tmp[i]);
						relp_array.push(param[idx]);
						relp_array.push(param[idx + 1]);
						param.splice(idx, 2);
					}
					ws.SQLFileExec(fn + '.sql', param, t, relp_array, APP.IMXFN.callback[fn]);
				}else{
					ws.SQLFileExec(fn + '.sql', param, t, APP.IMXFN.callback[fn]);
				}
			}else{
				console.debug('Web Socket Closed...');
			}
		},
		execParamToCall : function(ws, fn, param, type, callback){
			var t = type || 0;
			if(ws && ws.OPEN){
				var pair = IMXFN.pair
				, tmp = pair[fn]
				, relp_array = []
				, idx = 0, i = 0;
				if(tmp){
					for(i ; i < tmp.length; i++){
						idx = _.indexOf(param, tmp[i]);
						relp_array.push(param[idx]);
						relp_array.push(param[idx + 1]);
						param.splice(idx, 2);
					}
					ws.SQLFileExec(fn + '.sql', param, t, relp_array, callback);
				}else{
					ws.SQLFileExec(fn + '.sql', param, t, callback);
				}
			}else{
				console.debug('Web Socket Closed...');
			}
		},
		callback : {
			txn_detail_drag : function(AHeader, AData){
				console.debug('call back : txn_detail_drag');
				/**
				 * result[0] : 0: time, 1 : txn_elpase: 2: exception
				 * result[1] : 0: time, 1: was_id, 2: was_name, 3: txn_name, 4: client_ip, 5: txn_elapse, 6: sql_elapse, 7: tp_elapse, 8: tid, 9: txn_id, 10: login_name,
				 *  11: EXCEPTION, 12: start_time, 13: sql_exec_count, 14: fetch_count, 15: sql_elapse_avg, 16: remote_elapse, 17: remote_count
				 */
				if(AHeader.rows_affected){
					if (AData != undefined && Array.isArray(AData.result)) {

					}else{
						console.debug(AData.result.Error_Message);
					}
				}else{
					$('#txnTrendView').children().remove();
				}

			},
			txn_detail_drag_sql_chart : function(AHeader, AData){
				console.debug('call back : txn_detail_drag_sql_chart');
				if (AData != undefined && Array.isArray(AData.result)) {

				}else{
					console.debug(AData.result.Error_Message);
				}

			},
			txn_detail_drag_sql_grid : function(AHeader, AData){
				console.debug('call back : txn_detail_drag_sql_grid');
				if (AData != undefined && Array.isArray(AData.result)) {
					console.debug(AData);
				}else{
					console.debug(AData.result.Error_Message);
				}

			},
			txn_detail : function(AHeader, AData){
				console.debug('call back : txn_detail');
				/**
				 * result[0] : 0: LVL, 1: was_id, 2: was_name, 3: method_id, 4: crc, 5: class_name, 6: mehtod_name, 7: calling_method_id, 8: calling_crc, 9: error_count
				 * 10: exec_count, 11: elapse_time, 12: elapse_ratio, 13: method_type, 14: method_seq, 15: level_id
				 *
				 *  result[1] : 0: method_id, 1: class_name, 2: mehtod_name, 3: exec_count, 4: elapse_time, 5: error_count
				 *
				 *  result[2] : 0: web_ip
				 *
				 *  result[3] : 0: TIME, 1: was_id, 2: was_name, 3:txn_id, 4:instance_name, 5: db_id, 6: sql_id, 7: method_id, 8: method_seq, 9: sql_exec_count, 10: sql_elapse_max
				 *  11: sql_elapse_avg, 12: cpu_time, 13: wait_time, 14: logical_reads, 15: physical_reads, 16: sql_text
				 *
				 */
				if (AData != undefined && Array.isArray(AData.result)) {

				}else{
					console.debug(AData.result.Error_Message);
				}
			},
			txn_detail_path : function(AHeader, AData){
				console.debug('call back : txn_detail_path');
				/**
				 * result[0] : 0: lvl, 1: time, 2: tid, 3: type, 4: p_was, 5: WAS_NAME, 6: txn_id, 7: TXN_NAME, 8: method, 9: c_tid, 10: was, 11: c_was_name, 12: c_txn_id
				 * 13: dest, 14: p_elapse_time, 15: c_elapse_time, 16: p_exec_cnt, 17: c_exec_cnt, 18: txn_elapse, 19: c_txn_elapse, 20: web_ip
				 *
				 * result[1] : 0: WAS_ID, 1: was_name, 2: DB_ID, 3:INSTANCE_NAME, 4: exec_cnt, 5:elapse_time, 6:elapse_time_max
				 *
				 * result[2] : 0: was_id, 1: wsa_name, 2: tid, 3: txn_name, 4: txn_elaspe, 5: remote_elapse
				 */
				if (AData != undefined && Array.isArray(AData.result)) {

				}else{
					console.debug(result.Error_Message);
				}
			},
			txn_detail_web : function(AHeader, AData){
				console.debug('call back : txn_detail_web');
				/**
				 * result: 0: web_ip, 1: was_id, 2: was_name, 3:exec_count, 4:w_elapse_time
				 */
				if(AHeader.rows_affected){
					if (AData != undefined) {

					}else{
						console.debug(AData.result.Error_Message);
					}
				}
//				IMXFN.execParam(socket,'txn_detail_path', IMXFN.paramConvert({tid : APP.datas.url.topTid, call_sql_list: 1}), 1);
			},
			txn_detail_client : function(AHeader, AData){
				console.debug('call back : txn_detail_client');
				/**
				 * result : 0: client_ip, 1: CLIENT_TIME
				 */
				if(AHeader.rows_affected){
					if (AData != undefined) {

					}else{
						console.debug(AData.result.Error_Message);
					}
				}
//				APP.IMXFN.execParam(APP.socket,'txn_detail_web', APP.IMXFN.paramConvert({tid : APP.datas.url.topTid}), 1);
			},
			txn_detail_remote : function(AHeader, AData){
				console.debug('call back : txn_detail_remote');
				/**
				 * result : 0: time, 1: method, 2: ELAPSE_TIME, 3: DEST, 4: METHOD_Id, 5: METHOD_SEQ, 6: port, 7: tid
				 */
				if(AHeader.rows_affected){
					if (AData != undefined) {

					}else{
						console.debug(AData.result.Error_Message);
					}
				}else{

				}
			},
			txn_detail_path_web : function(AHeader, AData){
				console.debug('call back : txn_detail_path_web');
				if (AData != undefined && Array.isArray(AData.result)) {

				}
			},
			txn_detail_active : function(AHeader, AData){
				console.debug('call back : txn_detail_active');
				/**
				 * result : 0: "time", 1: "was_id", 2: "was_name", 3: "tid", 4: "txn_id", 5: "txn_name", 6: "client_ip", 7: "start_time", 8: "avg_elapse", 9: "elapse_time", 10: "pool_id", 11: "pool_name", 12: "instance_name",
				 *	13: "sid", 14: "state", 15: "sql_id1", 16: "sql_text_1", 17: "sql_id2", 18: "sql_text_2", 19: "sql_id3", 20: "sql_text_3", 21: "sql_id4", 22: "sql_text_4", 23: "sql_id5", 24: "sql_text_5", 25: "sql_exec_count",
				 *	26: "fetch_count", 27: "prepare_count", 28: "class_method", 29: "method_type", 30: "current_crc", 31: "cpu_time", 32: "wait_time", 33: "db_time", 34: "mem_usage", 35: "logical_reads", 36: "physical_reads",
				 *	37: "wait_info", 38: "thread_cpu", 39: "login_name", 40: "io_read", 41: "io_write", 42: "bind_list"
				 */
				if(AHeader.rows_affected){
					if (AData != undefined) {

					}else{
						console.debug(AData.result.Error_Message);
					}
				}

			},
			txn_detail_exception : function(AHeader, AData){
				console.debug('call back : txn_detail_exception');
				/**
				 * result: 0: log_text, 1: log_id, 2: sql_id, 3: bind_list
				 */
				if(AHeader.rows_affected){
					if (AData != undefined) {

					}else{
						console.debug(AData.result.Error_Message);
					}
				}

			},
			txn_detail_bindsql : function(AHeader, AData){
				console.debug('call back : txn_detail_bindsql');
				/**
				 * result[0] : 0: TIME, 1: bind_list, 2:sql_id, 3: elapse_time
				 * result[1] : 0: sql_text
				 */
				if(AHeader.rows_affected){
					if (AData != undefined && Array.isArray(AData.result)) {

					}else{
						console.debug(AData.result.Error_Message);
					}
				}
			},
			txn_detail_sum_call : function(AHeader, AData){
				console.debug('call back : txn_detail_sum_call');
				if (AData != undefined && Array.isArray(AData.result)) {

				}
			},
			txn_detail_chart_drag : function(AHeader, AData){
				console.debug('call back : txn_detail_chart_drag');
				if(AHeader.rows_affected){
					if (AData != undefined) {

					}else{
						console.debug(AData.result.Error_Message);
					}
				}else{
					APP.store.txnStore.removeAll();
				}

			},
			txn_detail_node_dbclick: function(AHeader, AData){
				console.debug('call back : txn_detail_node_dbclick');
				/**
				 * result : 0: time, 1: was_id, 2: WAS_NAME, 3: instance_name, 4: TID, 5: TXN_ID, 6: TXN_NAME, 7: client_ip, 8: SQL_EXEC_COUNT, 9: TXN_ELAPSE, 10: FETCH_COUNT, 11: START_TIME
				 */
				if(AHeader.rows_affected){
					if (AData != undefined) {

					}else{
						console.debug(AData.result.Error_Message);
					}
				}

			}
		}
};