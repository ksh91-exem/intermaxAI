/*
 * 
 * http://stackoverflow.com/questions/3603910/need-a-unique-id-in-javascript-for-tab-windows-and-for-new-windows-in-internet-e
 */

//------------------------------------------------------------------------------
//-- guarantees that window.name is a GUID, and that it would
//-- be preserved whilst window life cicle
//--
//-- for frames and iframes, the outermost window determines the GUID
//--
//-- for every form it will be appended a hidden element of id
//-- "this.window.GUID" for server-side references
//------------------------------------------------------------------------------
//-- window.name will be set to "GUID-<A_GUID>"
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
//-- Retrieves window GUID, initializing it if necessary -----------------------
//------------------------------------------------------------------------------
var object_guid = '';
function getWindowGUID() {
    //----------------------------------
    var windowGUID = function () {
        //----------
        var S4 = function () {
            return (
                    Math.floor(
                            Math.random() * 0x10000 /* 65536 */
                        ).toString(16)
                );
        };
        //----------

        return (
                S4() + S4() + "-" +
                S4() + "-" +
                S4() + "-" +
                S4() + "-" +
                S4() + S4() + S4()
            );
    };
    //----------------------------------

    //-- traverses up in the hierarchy for the outermost window ----------------
	object_guid = "GUID-" + windowGUID();
	if(typeof(window)!='undefined')
	{
		var topMostWindow = window;

		while (topMostWindow != topMostWindow.parent) {
			topMostWindow = topMostWindow.parent;
		}

		//-- initialize GUID if needed ---------------------------------------------

		if (!topMostWindow.name.match(/^GUID-/)) {
			topMostWindow.name = object_guid;
		}
	}
	return object_guid;

    //-- return GUID -----------------------------------------------------------


} //-- getWindowGUID -----------------------------------------------------------
getWindowGUID() 
//------------------------------------------------------------------------------
//-- Append via jQuery handlers for windowLoad ---------------------------------
//------------------------------------------------------------------------------

if(typeof($) != 'undefined'){
	$(window).load(
		function () {
			windowLoadSetGUID();
			// windowLoadSetGUIDOnForms();
		}
	) 
}//----------------------------------------------------------------------------

function windowLoadSetGUID() {
    var dummy = getWindowGUID();
} //-- windowLoadSetGUID -------------------------------------------------------

function windowLoadSetGUIDOnForms() {
    var formList = $('form');
    var hidGUID = document.createElement("input");

    hidGUID.setAttribute("type", "hidden");
    hidGUID.setAttribute("name", "this.window.GUID");
    hidGUID.setAttribute("value", getWindowGUID());

    if (formList.length == 1) {
        formList.append(hidGUID);
    }
    else {
        for (var i = 0; i < formList.length; ++i) {
            formList[i].append(hidGUID);
        }
    }
} //-- windowLoadSetGUIDOnForms ------------------------------------------------



// -- Kim uizu >>


Date.prototype.toCurrentString = function() {
   var yyyy = this.getFullYear().toString();
   var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
   var dd  = this.getDate().toString();
   var hh  = this.getHours().toString();
   var nn  = this.getMinutes().toString();
   var ss  = this.getSeconds().toString();
   
   if( (yyyy+mm+dd+hh+nn+ss).indexOf('NaN') > -1 )
	   return '';   
   return yyyy +'-'+ (mm[1]?mm:"0"+mm[0]) +'-'+ (dd[1]?dd:"0"+dd[0]) + ' ' + (hh[1]?hh:"0"+hh[0]) + ':'+(nn[1]?nn:"0"+nn[0])+':'+(ss[1]?ss:"0"+ss[0]); // padding
};


function localStorageDelete( AGuid /* string */ )
{
	for( var a in localStorage )
	{
		if( a.indexOf( AGuid ) == 0 )
		{
			localStorage.removeItem( a )
		}
	}
}

function localStorageUpdate( AGuid /* string */ )
{
	localStorage.setItem( AGuid + '_expiry', new Date().toCurrentString()  );
}

function localStorageGetItem( AID )
{
	if( arguments.length == 2 )
	{
		return localStorage.getItem( arguments[0] +"_"+ arguments[1] );	
	}else
	{
		return localStorage.getItem( getWindowGUID() +"_"+ arguments[0] );
	}
	
}


function localStorageSetItem( AID, AValue )
{
	return localStorage.setItem( getWindowGUID() +"_"+AID, AValue );
}


function localStorageCheck() 
{
	var sGuid = getWindowGUID();
	
	// self update
	localStorageUpdate( sGuid );
	
	//Expiry
	var arrGuidList = [];
	
	for(var a in localStorage)
	{ 
	  if( a.match(/^GUID-/) ) 
	  {
		  var s = a.split("_")[0];
		  //console.log( a.split("_")[0] )
		  
		  if( arrGuidList.indexOf(s) == -1 )
			  arrGuidList.push( s );  	   
	  }
	}
	
	
	for( var i = 0 ; i < arrGuidList.length;  i++  )
	{
		if( localStorage.getItem( arrGuidList[i] + '_expiry' ) == null )
		{
			localStorageDelete( arrGuidList[i] );
			//console.log( 'delete', arrGuidList[i] )
		}else
		{
			var sExp = localStorage.getItem( arrGuidList[i] + '_expiry' );
			var nD   = new Date( sExp );
			
			
	        var diff =  ( (new Date().getTime() - nD.getTime()) ) / 1000  // 1 sec
	        var day_diff = Math.floor(diff / 86400);

	        // diff < 7200 && "1 hour ago" 
	        
	        // 1 hour over, delete
	        // 5 sec
	        if( diff > 10 )
	        {
	        	localStorageDelete( arrGuidList[i] );	        	
	        }
	        
	        //console.log( 'diff',diff, 'day_diff', day_diff , arrGuidList[i], 'nD', nD, 'new Date()', new Date() )
			
			
			//...
		}
	}
	

}

//-- Kim uizu end