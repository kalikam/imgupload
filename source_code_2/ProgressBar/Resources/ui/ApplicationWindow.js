//Application Window Component Constructor
exports.ApplicationWindow = function() {
	//declare module dependencies
	var FirstView = require('ui/FirstView').FirstView;
		
	//create object instance
	var self = Ti.UI.createWindow({
		title:'New Application',
		backgroundColor:'#ffffff'
	});
		
	//construct UI
	var firstView = new FirstView();
	self.add(firstView);
	
	return self;
};
