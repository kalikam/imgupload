//FirstView Component Constructor
exports.FirstView = function() {
	//this variable is for android to calculate the approx upload progress
	var androidUploadProgress = 0;	
	
	//let's hide the status bar on the iphone/ipad for neatness
	if(Ti.Platform.osname == 'iphone' || Ti.Platform.osname == 'ipad'){
		Titanium.UI.iPhone.statusBarHidden = true;
	}	
	
	//this function will take in a 'media' object (a photo from the gallery in this case)
	//and will upload it to our server via the PHP script. On a successful upload, our
	//server will return the new HTTP path of the image we uploaded, which we can then load
	//in the Safari/web browser so the user can view it.
	function UploadPhotoToServer(media){
		 if (Titanium.Network.online == true) {
	       self.children[0].show(); //show the uploading slider progress bar
	       self.children[0].children[0].width = 0; //make sure the default value is zero
	       self.children[1].show(); //show the uploading label
	       self.children[1].text = 'Uploading photo, please wait...'; //set the label to default value
	       self.children[2].hide(); //hide the select photo button
	       
	       var xhr = Titanium.Network.createHTTPClient();
	       
	       xhr.onerror = function(e){
		  		Ti.API.info('IN ERROR ' + e.error);
				alert('Sorry, we could not upload your photo! Please try again.');
	       };
	        
	       xhr.onload = function(){
		  		Ti.API.info('IN ONLOAD ' + this.status + ' readyState ' + this.readyState);
		  		if(this.responseText != 'false'){	
		  			var url = this.responseText; //set our url variable to the response		  			
		  			self.children[0].children[0].width = 298;  //set the progress to 100% (298px based on our design)		  			
		  			
	            	//if we successfully uploaded, then ask the user if they want to view the photo
	            	var confirm = Titanium.UI.createAlertDialog({ 
	            		title: 'Upload complete!', 
	            		message: 'Open your image in the browser?', 
	            		buttonNames: ['Yes', 'No']
	            	});
					confirm.addEventListener('click', function(conEvt) { 
					   //if the index selected was 0 (yes) then open in safari		
					   Ti.API.info(conEvt.index);		   
					   if(conEvt.index === 0){
					   		//open our uploaded image in safari
		  					Ti.Platform.openURL(url);	 
					   }
					   
					   //reset the upload button
					   self.children[0].hide(); //hide the status bar  
	            	   self.children[1].hide(); //hide the status label
	            	   self.children[2].show(); //show the upload button again
	            	   androidUploadProgress = 0; //reset the android progress value	            	
					});
					confirm.show();	            		  			 	
		  		}
		  		else {
		  			alert('Whoops, something failed in your upload script.');
	            	self.children[0].hide(); //hide the status bar  
	            	self.children[1].hide(); //hide the status label
	            	self.children[2].show(); //show the upload button again 
	                androidUploadProgress = 0; //reset the android progress value		  			
		  		}			
	        };
	    
		  	xhr.onsendstream = function(e){
		  		Ti.API.info('ONSENDSTREAM - PROGRESS: ' + e.progress);
	            if(Ti.Platform.osname == 'android')
	            {
	            	//android doesn't support the "progress" variable during onsendstream yet :(
	            	//we're going to dummy up a progress value for this based on each packet being about 2.5% of the total upload progress	
	            	//it won't be totally accurate, but it will give the user a good indicator that the upload is working
	            	if(androidUploadProgress < 1) {
	            		androidUploadProgress += 0.025;
		            	self.children[1].text = 'Uploading photo, please wait... ' + (Math.round(androidUploadProgress * 100)).toString().replace(".","") + '%';
	            		self.children[0].children[0].width = Math.round(298 * androidUploadProgress);
	            	}
	            }
	            else 
	            {
	            	//else on ios devices, calculate the progress of the upload using e.progress
		            if(Math.round(e.progress * 100) <= 100) {
		              self.children[1].text = 'Uploading photo, please wait... ' + (Math.round(e.progress * 100)).toString().replace(".","") + '%';
		              self.children[0].children[0].width = Math.round(298 * e.progress); //set the slider value to the nearest whole integer (ie 25%, not 24.95%)
		            }
	            }
			};
					
			// open the client
			xhr.open('POST', L('server')); //the server location comes from the 'strings.xml' file 
							
			// send the data
			xhr.send({
				media: media,
			});	
		}		
		else
		{
			alert('You must have a valid Internet connection in order to upload this photo.');
		}
	}
	
		
	
	//create object instance, a parasitic subclass of Observable
	var self = Ti.UI.createView({
		backgroundColor: '#232323'
	});
	
	//the view below is the background of the slider
	var progressBackgroundView = Ti.UI.createView({
		width: 300,
		height: 27,
		left: ((Ti.Platform.displayCaps.platformWidth - 300) / 2),		
		top: (Ti.Platform.displayCaps.platformHeight / 2),
		visible: false,
		backgroundImage: 'assets/images/track-complete.png'
	});
	self.add(progressBackgroundView);	
	
	//the slider will show a graphical representation of the upload progress
	//backgroundImage will reduce flicker as it doesn't redraw every width change like 'image' will
	var progressView = Ti.UI.createImageView({
		width: 0,
		height: 25,
		left: 1,		
		top: 1,
		backgroundImage: 'assets/images/bar.jpg',
		borderRadius: 3
	});
	progressBackgroundView.add(progressView);	
	
	//this label will show the upload progress as a percentage (i.e. 25%)
	var lblSending = Ti.UI.createLabel({
		width: 'auto',
		right: ((Ti.Platform.displayCaps.platformWidth - 300) / 2),
		top: ((Ti.Platform.displayCaps.platformHeight / 2) + 30),
		text: '',
		height: 20,
		font: {fontFamily: 'Arial', fontSize: 14, fontWeight: 'bold'},
		color: '#fff',
		textAlign: 'right',
		visible: false
	});
	self.add(lblSending);
		
	//this button will appear initially and allow the user to choose
	//a photo from their gallery	
	var btnChoosePhoto = Ti.UI.createButton({
		width: 220,
		height: 35,
		title: 'Select photo for upload.',
		font: {fontFamily: 'Arial'},
		color: '#000000',
		top: (Ti.Platform.displayCaps.platformHeight / 2),
		visible: true
	});
	btnChoosePhoto.addEventListener('click', function(e){
		Titanium.Media.openPhotoGallery({
	        success:function(event)
	        {	          
	            Ti.API.debug('Our type was: '+event.mediaType);
	            if(event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO)
	            {
	            	UploadPhotoToServer(event.media);
	            }
	        },
	        cancel:function()
	        {	
	        },
	        error:function(err)
	        {
	        	Ti.API.error(err);
	        },
	        mediaTypes:[Ti.Media.MEDIA_TYPE_PHOTO]
	    });
	});
	self.add(btnChoosePhoto);
	
	return self;
};
