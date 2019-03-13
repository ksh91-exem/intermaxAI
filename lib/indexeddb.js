/**
 * Created by jcwon on 14. 1. 20.
 *
 * Indexed DB ( API : https://developer.mozilla.org/en-US/docs/Web/API )
 *
 * InterMax 필요한 Store
 * Grid
 *
 */


var IndexedDB;

IndexedDB = function( databaseName, verSion, paramEnableErrorLog ) {

    var self          = this;
    var db            = null;
    var database_name = databaseName || "Default";
    var version       = verSion || 1;
    var enableErrorLog = paramEnableErrorLog || false;
    var Isinitialize  = false;

    console.log( "Start" );

    function getStore( storeName, dbtype ){
        var tx    = db.transaction( [ storeName ], dbtype );
        var store = tx.objectStore( storeName );

        return function(){ return store };
    }

    function setTime( data, addTime ){
        if ( addTime === "undefined" ){
            data.time = Date.now();
        }
        else if ( addTime !== null ) {
            data.time = addTime;
        }

        if ( enableErrorLog )
            console.log( "Debug in setTime() - ", data );
    }

    function checkDatabse() {

        window.indexedDB      = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
        window.IDBKeyRange    = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

        if ( !window.indexedDB ) {
            window.alert("Your browser doesn't support a stable version of IndexedDB. Such and feature will not be available.");
            return false;
        }

        return true;
    }

    self.database_open = function(databasename, version, successCallback, upgradeneededCallback ) {
        try {
            if ( !window.indexedDB.open ) {
                console.log("windon.indexedDB.open is null in openDB()");
                return;
            }

            var openRequest = window.indexedDB.open( databasename, version );

            openRequest.onerror = function (event) {
//        alert( "Why didn't you allow my web app to use IndexedDB?!" );
                    console.log('[' + database_name + "] - " +
                        (event.target.error ? event.target.error : event.target.errorCode) );
            };

            openRequest.onsuccess = function (event) {
                if ( enableErrorLog ) {
                    console.log('[' + database_name + "] - " + "open_success");
                }

                db = event.target.result;

                if ( successCallback )
                    successCallback( event );

                self.clearStore( "volatile" );
                Isinitialize = true;

                db.onerror = function (event) {
                    console.log('[' + database_name + "] - " + event.target.error.name + ' : ' + event.target.error.message);
                };
            };

            openRequest.onupgradeneeded = function (event) {
                if (enableErrorLog){
                    console.log('[' + database_name + "] - " + "open_upgradeneeded");
                }

                db = event.target.result;

                if ( !db ) {
                    console.log(" db (i.e., event.target.result) is null in open_upgradeneeded()");
                    return;
                }

                if( upgradeneededCallback ) {
                    upgradeneededCallback( event );
                } else {
                    try {
                        // Add Store. ===================================================

                        // environment
                        db.createObjectStore( "environment", {keyPath: "section"} );

                        // bug log
                        var log = db.createObjectStore( "Log", {keyPath: "Title"} );
                        log.createIndex( "datetime", "datetime", {unique: false} );

                        // grid environment
                        db.createObjectStore( "grid_environment", {keyPath: "gridName" } );

                        // ScriptManger Tree
                        db.createObjectStore( "scriptManager", {keyPath: "scriptName"} );

                        // DB Stat
                        var stat = db.createObjectStore( "dbStat", {keyPath: "statName"} );
                        stat.createIndex( "groupName, statName", ["groupName", "statName"], {unique:false} );

                        var wasstat = db.createObjectStore( "wasStat", {keyPath: "statName"} );
                        wasstat.createIndex( "wasStat", "wasStat", {unique: true} );

                        // Etc
                        var dyn = db.createObjectStore( "dynamic_environment", {keyPath: "title"} );
                        dyn.createIndex( "title, section", ["title", "section"], {unique: true} );

                        // volatile
                        db.createObjectStore( "volatile", {keyPath: "name"});

                        // End add Store ====================================================
                    } catch (e){
                        console.log( "Exception in onupgradeneeded() - " + e.message );
                    }
                }
            };

            openRequest.onblocked = function open_blocked(event) {
                console.log("The database is blocked - error code : " +
                    event.target.error ? event.target.error : event.target.errorCode +
                    " If this page is open in other browser windows, close these windows. ");
            };
        } catch (e) {
            console.log("window.IndexedDB.open exception in openDB() - " + e.message);
        }
    };

    self.putStore = function ( storeName, data, addTime ) {
        try {
            var store = getStore( storeName, "readwrite" )();

            if ( !store ) {
                console.log( "Not found store [" + storeName + "]." );
                return;
            }

            setTime( data, addTime );

            store.put( data );
            store = null;
        } catch (e) {
            console.log('[' + self.database_name + "] - " + "Exception in putStore() - " + e.message);
        }
    };

    self.addStore = function( storeName, data, addTime ) {
        try {
            var store = getStore( storeName, "readwrite" )();

            if ( !store ) {
                console.log( "Not found store [" + storeName + "]." );
                return;
            }

            setTime( data, addTime );

            store.add( data );
            store = null;
        } catch (e) {
            console.log( '[' + self.database_name + "] - " + "Exception in addStore() - " + e.message );
        }
    };

    self.database_delete = function ( databasename, successCallback, failCallback ) {
        try {
            if ( !confirm( "Do you want to delete " + databasename + "database ?" ) ){
                return;
            }

            if ( db ) {
                db.close();
            }

            var deleteRequest = window.indexedDB.deleteDatabase( databasename );

            deleteRequest.onerror = function (event) {
                if( failCallback )
                    failCallback( event );

                if ( enableErrorLog ){
                    console.log("delteRequest.onerror fired in deleteDB() - " +
                        (event.target.error ? event.target.error : event.target.errorCode) );
                }
            };

            deleteRequest.onsuccess = function (event) {
                if( successCallback )
                    successCallback( event );

                db = null;

                alert("The database has been deleted.");
            };
        } catch (e) {
            console.log('[' + database_name + "] - " + "Exception in deleteDB() - " + e.message);
        }
    };

    self.database_close = function () {
        if( db )
            db.close();
    };

    self.deleteKeypath = function (storeName, keyName, successCallback, failCallback) {
        try {
//            if ( !confirm( "Do you want to delete " + storeName + "in " + keyName + " Index ?" ) ){
//                return;
//            }

            var store = getStore( storeName, "readwrite")();
            var request = store.delete( keyName );

            request.onsuccess = function (event) {
                if (successCallback)
                  successCallback( event );

                if ( enableErrorLog ){
                    console.log( "Debug in deleteIndex() - [" + keyName + "] delete in " + storeName );
                }
            };

            request.onerror = function( event ) {
                if (failCallback)
                    failCallback( event );

                if ( enableErrorLog ){
                    console.log( "Debug in deleteIndex() - " + event.target.error.message);
                }
            };

        } catch (e) {
            console.log( "Exception in deleteIndex() - " + e.message);
        }
    };

    self.clearStore = function( storeName, successCallback, failCallback) {
        try {
            if ( Isinitialize )
                if ( !confirm( "Do you want to clear store [" + storeName  + "] ?" ) ){
                    return;
                }

            var store   = getStore( storeName, "readwrite" )();
            var request = store.clear();

            request.onsuccess = function (event) {
                if( successCallback )
                    successCallback( event );

                if ( enableErrorLog ){
                    console.log( "[success] Debug in clearStore() - ", event );
                }
            };

            request.onerror = function (event) {
                if( failCallback )
                    failCallback( event );

                if ( enableErrorLog ){
                    console.log( "[error] Debug in clearStore() - " + event.target.error.message );
                }
            };

            store = null;
            request = null;
        } catch (e) {
            console.log("Exception in clearStore - " + e.message);
        }
    };

    self.getStoreCount = function( storeName, successCallback, failCallback ) {
        try {
            var store   = getStore( storeName, "readonly" )();
            var request = store.count();

            request.onsuccess = function( event ){
                if( successCallback )
                  successCallback( event );

                if ( enableErrorLog ){
                    console.log( "[success] Debug in getStoreCount() - record count : ",  event.target.result );
                }
            };

            request.onerror = function( event ){
                if( failCallback )
                    failCallback( event );

                if ( enableErrorLog ){
                    console.log( "[error] Debug in getStoreCount() - record count : ",  event.target.message );
                }
            };

            store = null;
            request = null;
        } catch (e) {
            console.log('[' + database_name + "] - " + "Exception in getStoreCount() - " + e.message);
        }
    };

    self.getIndex = function( storeName, indexName, keyName, successCallback, failCallback ){
        var store   = getStore( storeName, "readonly" )();
        var request = store.index( indexName).get( keyName );

        request.onsuccess = function( event ) {
            if( successCallback )
                successCallback( event );

            if( enableErrorLog ){
                console.log( "[success] Debug in getIndex() - ", event );
            }
        };

        request.onerror = function( event ) {
            if( failCallback )
                failCallback( event );

            if( enableErrorLog ){
                console.log( "[error] Debug in getIndex() - " + event.target.error.message );
            }
        };

        store = null;
        request = null;
    };

    self.getRangeIndex = function( storeName, indexName, fromKeyName, toKeyName, successCallback, failCallback ){
        var records = [];
        var tx = db.transaction( [ storeName ], "readonly" );

        tx.oncomplete = function( event ) {
            if(successCallback)
                successCallback( records );
        };
        tx.onerror = function( event ) {
            if( failCallback )
                failCallback( event );
        };

        var boundKeyRange  = window.IDBKeyRange.bound(fromKeyName, toKeyName, false, true);

        var request = tx.objectStore( storeName ).index( indexName).openCursor( boundKeyRange );

        request.onsuccess = function( event ) {
            var cursor = event.target.result;

            if( cursor ) {
                if( enableErrorLog ){
                    console.log("[success] Debug in getRangeIndex() - ", cursor );
                }

                records.push( cursor.value ); //cursor.value.name
                cursor.continue();
            }
        };

        request.onerror = function( event ) {

            if( enableErrorLog ) {
                console.log('[' + database_name + "] - " + "one record fetch failed: ", event);
            }
        };
    };

    self.getAllIndex = function( storeName, indexName, successCallback, failCallback ) {
        var tx = db.transaction( [ storeName ], "readonly" );
        var arrKeyNames  = [];
        var arrKeyValues = [];

        tx.oncomplete = function( event ) {
            if(successCallback)
                successCallback( arrKeyNames, arrKeyValues );

            if( enableErrorLog ){
                console.log( "Debug in getAllIndex() - KeyNames", arrKeyNames );
                console.log( "Debug in getAllIndex() - keyValues", arrKeyValues );
            }
        };

        tx.onerror = function( event ) {
            if( failCallback )
                failCallback( event );

            if( enableErrorLog ){
                console.log( "Debug in getAllIndex() - " + event.target.message );
            }
        };

        var request = tx.objectStore( storeName ).index( indexName ).openCursor();

        request.onsuccess = function( event ){
            var cursor = event.target.result;

            if (cursor) {
                if( enableErrorLog ){
                    console.log( "[success] Debug in getIndex() - keyname : "+ cursor.key + " is keyValue : " , cursor.value );
                }

                arrKeyNames.push( cursor.key );
                arrKeyValues.push( cursor.value );

                cursor.continue();
            }
        };

        request.onerror = function( event ){
            console.log( "[error] Debug in getIndex() - " + event.target.message );
        };
    };

    self.getRangeRecord = function( storeName, fromKeyName, toKeyName, successCallback, failCallback ){

        var records = [];
        var tx = db.transaction( [ storeName ], "readonly" );

        tx.oncomplete = function( event ) {
            if(successCallback)
                successCallback( storeName, records );
        };
        tx.onerror = function( event ) {
            if( failCallback )
                failCallback( event );
        };

        var boundKeyRange  = window.IDBKeyRange.bound(fromKeyName, toKeyName, false, true);

        var request = tx.objectStore( storeName ).openCursor( boundKeyRange );

        request.onsuccess = function( event ) {
            var cursor = event.target.result;

            if( cursor ) {
                records.push( cursor.value ); //cursor.value.name
                cursor.continue();
            }
        };

        request.onerror = function( event ) {

            if( enableErrorLog ) {
                console.log('[' + database_name + "] - " + "one record fetch failed: ", event);
            }
        };
    };

    self.getRecord = function (storeName, keyName, successCallback, failCallback) {
        try{
            var store   = getStore( storeName, "readonly" )();
            var request = store.get( keyName );

            request.onsuccess = function( event ) {
                if( successCallback )
                  successCallback( event );

                if( enableErrorLog ){
                    console.log( "[success] Debug in getRecord() - ", event.target.result );
                }
            };

            request.onerror = function( event ) {
                if( failCallback )
                    failCallback( event );

                if( enableErrorLog ){
                    console.log( '[error][' + database_name + "] - " + event.target.error.message );
                }
            };

            store = null;
            request = null;
        } catch(e) {
            console.log( '[' + database_name + "] - " + "Exception in getRecord() - " + e.message );
        }
    };

    self.getAllRecord = function ( storeName, successCallback, failCallback ) {
        try {
            var records = [];
            var tx = db.transaction( [storeName], "readonly" );

            tx.oncomplete = function( event ) {
                if( successCallback )
                    successCallback( records );
            };

            tx.onerror = function( event ) {
                if( failCallback )
                    failCallback( event );
            };

            var request = tx.objectStore( storeName ).openCursor();

            request.onsuccess = function( event ) {
                var cursor = event.target.result;

                if( cursor ) {
                    //console.log(cursor.key);
                    records.push( cursor.value );
                    cursor.continue();
                }
            };

            request.onerror = function( event ) {
                if( enableErrorLog ) {
                    console.log('[' + database_name + "] - " + "one record fetch failed: ", e);
                }
            };

        } catch(e) {
            console.log( '[' + database_name + "] - " + "Exception in getAllRecord() - " + e.message );
        }
    };

    self.saveTofile = function( storeName, fromKeyName, toKeyName ) {
        try {
            self.getRangeRecord( storeName, fromKeyName, toKeyName, save );
        } catch(e) {
            console.log( '[' + database_name + "] - " + "Exception in saveTofile() - " + e.message );
        }
    };

    function save( storeName, records ){
        console.log( event );
        var textsave = new textFilesave( storeName );

        textsave.saveTextAsFile( records );
        textsave = null;
    }


    (function initialize( open, clear ){
        // 브라우저가 indexeddb를 지원하지는 검사.
        if ( !checkDatabse() )
            return;

        console.log( database_name );

        open( database_name, version, null, null );
    })( self.database_open );
};

