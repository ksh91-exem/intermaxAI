
// ����������

Ext.define('pa.layout.cropimage.window', {
	extend : 'Ext.Window',	
	autoShow: true,
	id : 'cropimage_window',
	autoDestroy:true,
	hideShadowOnDeactivate: true,
	constrainHeader : false,
	maximizable: false,
    //title: 'Crop Image',
	title : '',
	x : -6,
	y : -6,
	frame: false,
	header: false,
	resizable: false,
	closeAction:'hide',
	border:false,
	preventHeader: true,
    width: 2400,
    height: 1510,
    layout: {
        type: 'fit'
    },
    
	initComponent : function()
	{
		Ext.applyIf( this,
		{
			items:
			[
				{
	                    xtype: 'panel',
	                    floation:true,
	                    bodyBorder:false,
	                    animCollapse:false,
	                    collapsed:false,
	                    overlapHeader:false,
	                    collapsible:false,
	                    titleCollapse:false,
	                    
	                    
	                    layout: {
		    		        align: 'stretch',
		    		        type: 'vbox'
		    		    },
	                    items:[ 
								{
						            frame: false,
						            border: false,
						            flex: 1,
						            id : 'cropimage_iframe',
						            xtype : "component",						            
						            autoEl : {
						                tag : "iframe",
						                src: 'crop_preview.html',
						                						                
						            },
						            listeners: {
						                afterrender: function () {
						                    
						                    //  �����ο� iframe  Element�� Create �������� load �̺�Ʈ�� �����Ų��.
						                    this.getEl().on('load', function () {

						                        //console.log('loaded', Ext.getCmp('cropimage_window').original_image, window.cropimage_iframe );
						                        var crop = Ext.getCmp('cropimage_window');
						                        if(crop.original_image){
						                            setTimeout( function( data ){
						                                window.cropimage_iframe.contentWindow.procImg(data);
//						                                eval('window.cropimage_iframe.procImg("'+ data  +'")'); 
						                            }, 10 , Ext.getCmp('cropimage_window').original_image );
						                        }
						                        
						                        
						                    });
						                }
						                	
						            }

						        },
						        /*
								{
						        	xtype : 'button',
						        	text : 'Download Image',
						         	margin : '10px',
						        	height : 30,
						        	handler: Ext.create('pa.layout.cropimage.window.downloadimage').fn,
								}
								*/
								
								 
	                    ],
	                
	                }
				
			],
		
		});
		
		this.callParent(arguments);
		
	},
	
	setImage : function( ADataUrl /* string */ )
    {
        //eval('window.cropimage_iframe.procImg("'+ ADataUrl  +'")');
        this.original_image = ADataUrl;
    },
	
	listeners :
	{
		show : function( ADataUrl /* string */ )
	    {
	        //this.maximize();
	        //this.setPosition(-8,-8);
	        //this.setWidth( Ext.getBody().getWidth() +100);
	        //this.setHeight( Ext.getBody().getHeight() +100 );
	    },
		hide  : function(  )
	    {
	        Ext.getCmp('cropimage_window').destroy();
	    },
		destroy : function(  )
	    {
	        Ext.getCmp('cropimage_window').original_image = null;
	    },
		 
	}
	
});



/** 바로 다운받기용 소스 **/

var cleanUp = function(a) {
  a.textContent = 'Downloaded';
  if(a.dataset)
      a.dataset.disabled = true;

  // Need a small delay for the revokeObjectURL to work properly.
  setTimeout(function( a ) {
    window.URL.revokeObjectURL(a.href);
    //a.remove();
    delete a;
  }, 300, a);
};

function procDownloadImg( ADataUrl /* string */ )
{
    var ABlod = dataURItoBlob(ADataUrl);
    //console.log( ABlod );
    var filename = "";
    filename = ADataUrl.split(',')[1].substring(0,30);
    
    var a = window.document.createElement('a');

   // 파일명
    a.download = 'download.png';
    a.href = window.URL.createObjectURL(ABlod);
    a.textContent = 'Download ready';
    
    a.dataset.downloadurl = [MIME_TYPE, a.download, a.href].join(':');
    a.draggable = true; // Don't really need, but good practice.        
 
    // 다운로드 시킴, 
     a.click();
     cleanUp(this);

}




function dataURItoBlob(dataURI) {
      // convert base64 to raw binary data held in a string
      // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
      var byteString = atob(dataURI.split(',')[1]);

      // separate out the mime component
      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

      // write the bytes of the string to an ArrayBuffer
      var ab = new ArrayBuffer(byteString.length);
      var ia = new Uint8Array(ab);
      for (var i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
      }

      // write the ArrayBuffer to a blob, and you're done
      var bb = new Blob([ab],{type: mimeString});
      //bb.append(ab);
      return bb; //.getBlob(mimeString);
    }

    const MIME_TYPE = 'image/png';

   /***바로 다운받기 소스 끝 **/

  function onBtnClick( ATarget )
  {
      // body 영역을 캡춰 Element 단위라서 특정 div 하려면 document.getElelmentbyId('아이디') 이런식으로 넘겨주면 됨.
     // html2canvas( document.body , 
     html2canvas( ATarget , 
     
      {
            // Canvas 로 복사 완료 이벤트
            onrendered: function(canvas) 
            {


                 // Crop Window 를 팝업 시킨다.

                  var cropWindow = Ext.getCmp('cropimage_window');
                  if( !cropWindow )
                        cropWindow = new Ext.create('pa.layout.cropimage.window');

                    //  console.log( canvas.toDataURL() );

                     // 캡춰한 이미지 던짐
                     cropWindow.setImage( canvas.toDataURL() );
                     // 팝업 띄움.
                     cropWindow.show();
             }

        });
   }


   function onBtnDownloadClick( ATargat )
   {
       html2canvas( ATargat , 
     
      {
            // Canvas 로 복사 완료 이벤트
            onrendered: function(canvas) 
            {

                     procDownloadImg( canvas.toDataURL()  );
             }

        });   
   }


