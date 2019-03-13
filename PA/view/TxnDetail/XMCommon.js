Common = {
		fn : {
			strSlice: function(str, length){
				if(str.length > length){
					return str.slice(0, length - 3) + '...';
				}else{
					return str;
				}
			},
			toMliFix: function(value){
				return ((value*1 || 0) / 1000).toFixed(3);
			},
			splitN: function(str, delimiter){
				if(str == null){
					str = '';
				}
				return str.split(delimiter);
			},
			lPad: function(d, n, r){
				var s = d + '';
				if(n){
					for(var i = 0 ; i < n; i++){
						if(s.length == n){
							return s;
						}else{
							s = (r || '0') + s;
						}
					}
					return s;
				}
				return d;
			},
			dateToYMDHMS: function(time) {
				var date = new Date(time)
				, y = date.getFullYear()
				, M = date.getMonth() + 1
			    , d = date.getDate()
			    , h = date.getHours()
			    , m = date.getMinutes()
			    , s = date.getSeconds();

			    return '' + y + '-' + (M<=9 ? '0' + M : M) + '-' + (d <= 9 ? '0' + d : d) + ' ' + (h <= 9 ? '0' + h : h) + ':' + (m <= 9 ? '0' + m : m) + ':' + (s <= 9 ? '0' + s : s);
			},
			dateToUTCYMDHMS: function(time) {
				var date = new Date(time)
				, y = date.getUTCFullYear()
				, M = date.getUTCMonth() + 1
			    , d = date.getUTCDate()
			    , h = date.getUTCHours()
			    , m = date.getUTCMinutes()
			    , s = date.getUTCSeconds();

			    return '' + y + '-' + (M<=9 ? '0' + M : M) + '-' + (d <= 9 ? '0' + d : d) + ' ' + (h <= 9 ? '0' + h : h) + ':' + (m <= 9 ? '0' + m : m) + ':' + (s <= 9 ? '0' + s : s);
			},
			dateToUTCHMS: function(time) {
				var date = new Date(time)
			    , h = date.getUTCHours()
			    , m = date.getUTCMinutes()
			    , s = date.getUTCSeconds();

			    return '' + (h <= 9 ? '0' + h : h) + ':' + (m <= 9 ? '0' + m : m) + ':' + (s <= 9 ? '0' + s : s);
			},
			dateSetSecond: function(time, second){
				return (new Date(time) * 1) +( second * 1000 );
			},
			zeroToFixed: function(number, point){
		        if((number + '').indexOf('.') > 0){
		            return +(+number).toFixed(point || 3);
		        }else{
		            return +number;
		        }
		    },
		    round: function(value, point){
		        var v = Math.pow(10, point-1);
		        return Math.round(+value * v) / v;
		    },
		    h2c: function (val){
                var str = '';
                for (var i = 0; i < val.length; i += 2)
                    str += String.fromCharCode(parseInt(val.substr(i, 2), 16));
                return decodeURIComponent(escape(str));
            },
			/**
			 *  header - 1byte : total length;
			 *  content
			 * 		1 byte : idx (  0 = name bind , else idx)
			 * 	 	1 byte : type
			 * 		1 byte : bind length
			 * 		(bind lenght) byte : value
			 */
			ConvertBindList : function(bindList){
		        var i = 0,
		        totLength = 0,
		        result = [],
		        range = 2,
		        pos = 0,
		        idx = 0,
		        type = 0,
		        bind_length = 0,
		        bind_name = null,
		        bind_value = null,

		        byte = 2,
		        short = 4,
		        integer = 8,
		        double = 16;



		        var bindSubString = function(range){
		            var str = bindList.substr(pos, range);
		            pos += range;
		            return str;
		        };

		        // hex to decimal
		        var h2d = function(val){
		            return parseInt(val , 16);
		        };
		        // hex to float
		        var h2f = function(val){

		            var hex = parseInt('0x' + val);

		            return (hex & 0x7fffff | 0x800000) * 1.0 / Math.pow(2,23) * Math.pow(2,  ((hex>>23 & 0xff) - 127));
		        };
		        // hex to double
		        var h2lf = function(val){
		            var hex = parseInt('0x' + val);
		            var high = parseInt('0x' + val.slice(0, 8));
		            var low = parseInt('0x' + val.slice(8, 16));
		            var e = (high >> 52 - 32 & 0x7ff) - 1023;

		            return (high & 0xfffff | 0x100000) * 1.0 / Math.pow(2,52-32) * Math.pow(2, e) + low * 1.0 / Math.pow(2, 52) * Math.pow(2, e);
		        };
		        // hex to character
		        var h2c = function (val){
					try{
						var str = '';
						for (var i = 0; i < val.length; i += 2)
							str += String.fromCharCode(parseInt(val.substr(i, 2), 16));

						return decodeURIComponent(escape(str));
					}catch (e){
						return '';
					}finally{
						i = null ;
						str = null ;
					}
		        };

		        if(bindList){
		            // header
		            totLength = h2d(bindSubString(range));

		            for(i = 0 ; i < totLength; i++){
		                idx = h2d(bindSubString(range));

		                if(idx == 0){
		                    bind_length = h2d(bindSubString(range));
		                    bind_name = h2c(bindSubString(bind_length * 2));

//		                  result.push({
//		                      code : idx,
//		                      value : '\'' + bind_name + '\''
//		                  });
		                    idx = '\'' + bind_name + '\'';
		                }

		                type = h2d(bindSubString(range));

		                switch(type){
		                // null
		                case 0 : bind_value = null;
		                break;
		                // boolean
		                case 1 :
		                    bind_value = h2d(bindSubString(byte));
		                    bind_name = 'boolean';
		                    if(bind_value == 0){
		                        bind_value = false;
		                    }else{
		                        bind_value = true;
		                    }

		                    result.push({
		                        code : idx,
		                        value : bind_value
		                    });
		                    break;
		                    // byte
		                case 2 :
		                    bind_value = h2d(bindSubString(byte));
		                    bind_name = 'byte';

		                    result.push({
		                        code : idx,
		                        value : bind_value
		                    });
		                    break;
		                    // short
		                case 3 :
		                    bind_value = h2d(bindSubString(short));
		                    bind_name = 'short';

		                    result.push({
		                        code : idx,
		                        value : bind_value
		                    });
		                    break;
		                    // integer
		                case 4 :
		                    bind_value = h2d(bindSubString(integer));
		                    bind_name = 'integer';

		                    result.push({
		                        code : idx,
		                        value : bind_value
		                    });
		                    break;
		                    // long int
		                case 5 :
		                    bind_value = h2d(bindSubString(double));
		                    bind_name = 'long int';

		                    result.push({
		                        code : idx,
		                        value : bind_value
		                    });
		                    break;
		                    // float (single)
		                case 6 :
		                    bind_value = h2f(bindSubString(integer));
		                    bind_name = 'float';

		                    result.push({
		                        code : idx,
		                        value : bind_value
		                    });
		                    break;
		                    // double
		                case 7 :
		                    bind_value = h2lf(bindSubString(double));
		                    bind_name = 'double';

		                    result.push({
		                        code : idx,
		                        value : bind_value
		                    });
		                    break;
		                    // int64
		                case 8 :
		                    bind_value = h2d(bindSubString(double));
		                    bind_name = 'int64';

		                    result.push({
		                        code : idx,
		                        value : bind_value
		                    });
		                    break;
		                    // string
		                case 9 :
		                    bind_length = h2d(bindSubString(byte));
		                    bind_value = h2c(bindSubString(bind_length * 2));
		                    bind_name = 'string';
		                    result.push({
		                        code: idx,
		                        value : '\'' + bind_value + '\''
		                    });
		                    break;
		                    // date yyyy-mm-dd
		                case 10 :
		                    bind_value = h2d(bindSubString(double));
		                    bind_name = 'date';

		                    bind_value = Ext.Date.format(new Date(bind_value), Comm.dateFormat.NONE);

		                    result.push({
		                        code : idx,
		                        value : '\''+ bind_value + '\''
		                    });
		                    break;
		                    // time hh:mm:ss
		                case 11 :
		                    bind_value = h2d(bindSubString(double));
		                    bind_name = 'time';

		                    bind_value = Ext.Date.format(new Date(bind_value), Comm.dateFormat.HIS);

		                    result.push({
		                        code : idx,
		                        value : '\''+ bind_value + '\''
		                    });
		                    break;
		                    // time stamp yyyy-mm-dd hh:mm:ss
		                case 12 :
		                    bind_value = h2d(bindSubString(double));
		                    bind_name = 'time_stamp';

		                    bind_value = Ext.Date.format(new Date(bind_value), Comm.dateFormat.HMSMS);

		                    result.push({
		                        code : idx,
		                        value : '\''+ bind_value + '\''
		                    });
		                    break;
		                    // bytes
		                case 13 :
		                    bind_length = h2d(bindSubString(byte));
		                    bind_value = h2d(bindSubString(bind_length * 2));
		                    bind_name = 'bytes';
		                    result.push({
		                        code : idx,
		                        value : bind_value
		                    });
		                    break;
		                default : break;
		                }
		            }
		        }
		        return result;
		    },
			codeBitToMethodType : function(code){
				var result = '';

				if ((code & 1) > 0 )
					result = result + 'loop,';

				if ((code & 2)> 0 )
					result = result + 'synchronized,';

				if ((code & 4)> 0 )
					result = result + 'new alloc,';

				if ((code & 64)> 0 )
					result = result + 'exit,';

				if ((code & 128)> 0 )
					result = result + 'gc,';

				if ((code & 256)> 0 )
					result = result + 'arraycopy,';

				if ((code & 4096)> 0 )
					result = result + 'classloader,';

				if ((code & 8192)> 0 )
					result = result + 'thread,';

				if ((code & 16384)> 0 )
					result = result + 'reflect,';

				if ((code & 32768)> 0 )
					result = result + 'io,';

				if ((code & 65536)> 0 )
					result = result + 'net,';

				if ((code & 131072)> 0 )
					result = result + 'nio,';

				if ((code & 2097152)> 0 )
					result = result + 'enumeration,';

				if ((code & 4194304)> 0 )
					result = result + 'iterator,';

				if ((code & 8388608)> 0 )
					result = result + 'strbuffer,';

				if ((code & 16777216)> 0 )
					result = result + 'strtoken,';

				if ((code & 33554432)> 0 )
					result = result + 'blob,';

				if ((code & 67108864)> 0 )
					result = result + 'clob,';

				if ((code & 134217728)> 0 )
					result = result + 'xml,';

				if ((code & 536870912)> 0 )
					result = result + 'ejb,';

				if((typeof code) == 'string' ){
					return code;
				}
				return result.slice(0, result.length -1);
			},
            codeBitToMethodTypeCD : function(code){
                var result = '';

                if ((code & 1) > 0 )
                    result = result + 'info,';

                if ((code & 2)> 0 )
                    result = result + 'function,';

                if ((code & 4)> 0 )
                    result = result + 'database,';

                if ((code & 8)> 0 )
                    result = result + 'library,';

                if ((code & 16)> 0 )
                    result = result + 'file,';

                if ((code & 32)> 0 )
                    result = result + 'network,';

                if ((code & 64)> 0 )
                    result = result + 'remote,';

                if((typeof code) == 'string' ){
                    return code;
                }
                return result.slice(0, result.length -1);
            }
		}
};