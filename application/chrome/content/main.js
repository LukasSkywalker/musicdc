/* This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Creative Commons
 * Attribution-NonCommercial-ShareAlike Version 3.0, as published
 * by Creative Commons. See 
 * http://creativecommons.org/licenses/by-nc-sa/3.0/legalcode for
 * more details. */ 
 
 // ------------------------------------------------------------------
// use helper functions to hook up the mdc object so "this"
// works in the explorer object
// ------------------------------------------------------------------


Components.utils.import("resource://gre/modules/NetUtil.jsm");
Components.utils.import("resource://gre/modules/FileUtils.jsm");
/*Components.utils.import("resource://gre/modules/ctypes.jsm");

var lib = ctypes.open("C:\\Users\\Lukas\\Desktop\\Music\ Download\ Center\\tagd.dll");

Declare the signature of the function we are going to call 
var msgBox = lib.declare("MessageBoxW",
                         ctypes.winapi_abi,					ctypes.default_abi is more universal
                         ctypes.int32_t,
                         ctypes.int32_t,
                         ctypes.jschar.ptr,
                         ctypes.jschar.ptr,
                         ctypes.int32_t);
var MB_OK = 3;

var ret = msgBox(0, "Hello world", "title", MB_OK);
);

lib.close();*/


String.prototype.trim = function() {
  return this.replace(/^\s\s*/, "").replace(/\s\s*$/, "");
};


function mdc_startup() {
  mdc.startup();
}

/*function mdc_shutdown() {
  mdc.shutdown();
}*/


// ------------------------------------------------------------------
// attach to window events so mdc object can startup / shutdown
// ------------------------------------------------------------------

//window.addEventListener("load", mdc_startup, false);
//window.addEventListener("unload", mdc_shutdown, false);


// ------------------------------------------------------------------
// mdc object
// ------------------------------------------------------------------

var mdc = {
	currentTitle: "",
	currentType: "",
	currentId: "",
	currentLyrics: "",
	
	coverTimer: "",
	timer_checkFlashPlayer: "",
	
	strings: '',
	closeMessageBox: "this.parentNode.parentNode.setAttribute('hidden','true'); mdc.clearTree(this.parentNode.id)",
	reportURL: 'http://dieners.di.funpic.de/mdc/report-url.php?url=',
	
	browser_init: false,
	radio_init: false,
	
	initialized : false,

	playlist: '',
	currentPosition: 0,
	currentURL: '',
	currentName: '',
	
	searchEngine: "search",	

	startup : function() {
		mdc.checkFlashPlayer();
		mdc.playlist = new Array();
		var event_readCommandLine = {
		  notify: function(timer_readCommandLine) {
			mdc.readCommandLine();
		  }
		}
 		var timer_readCommandLine = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);
		timer_readCommandLine.initWithCallback(event_readCommandLine, 2000, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
	
		this.strings = document.getElementById("extendedlibrary-strings");
		/*Perform some startup thingies (strings, check for updates and stuff)*/
		if (this.initialized)
			return;
		this.initialized = true;
		var self = this;

		dump("Welcome to the Music Download Center");

		//var strings = document.getElementById("extendedlibrary-strings");
			this.updateAvailable = this.strings.getString('extendedlibrary.updateAvailable');
			this.message = this.strings.getString('extendedlibrary.message');
			this.URLCopied = this.strings.getString('extendedlibrary.URLCopied');
			this.activeDownloads = this.strings.getString('extendedlibrary.activeDownloads');
			this.downloads = this.strings.getString('extendedlibrary.downloads');
			this.playMusicOrStreamFrom = this.strings.getString('extendedlibrary.playMusicOrStreamFrom')+":";
			this.close = this.strings.getString('extendedlibrary.close');
			this.sendErrorReport = this.strings.getString('extendedlibrary.sendErrorReport');
			//this.noResultsFor = this.strings.getString('extendedlibrary.noResultsFor');
			//this.tryOtherServices = this.strings.getString('extendedlibrary.tryOtherServices');
			this.searchCompleted = this.strings.getString('extendedlibrary.searchCompleted');
			this.send = this.strings.getString('extendedlibrary.send');
			this.open = this.strings.getString('extendedlibrary.open');
			this.playlistWasSaved = this.strings.getString('extendedlibrary.playlistWasSaved');
			this.providePassword = this.strings.getString('extendedlibrary.providePassword')
			this.enterPassword = this.strings.getString('extendedlibrary.enterPassword');
			this.download = this.strings.getString('extendedlibrary.download');
			
		this.updateCheck();
		
		document.getElementById('searchbar-textbox').focus();
		serviceman.restoreDB();
		serviceman.restoreDBStructure();
		serviceman.compareSources();
		/*var showDialog = this.getPref("application.firstrun.enabled", "bool");
		if(showDialog){
			mdc.openWindow('chrome://mdc/content/firstrun.xul', '_blank', 'chrome,extrachrome,menubar,resizable,scrollbars,status,toolbar')
		}*/
		
		document.getElementById('tabbrowser-tabpanels').selectedPanel = document.getElementById("tab_search");
		this.hideNavBarElements('bla');
		
		var coverartPanel = document.getElementById('coverart-panel');
		coverartPanel.setAttribute('minheight', coverartPanel.getAttribute('width'));
		coverartPanel.setAttribute('maxheight', coverartPanel.getAttribute('width'));
		
		this.loadHistory();
		
		var event_readMessages = {
		  notify: function(timer_readMessages) {
			mdc.readMessages();
		  }
		}
 		var timer_readMessages = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);
		timer_readMessages.initWithCallback(event_readMessages,5000, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
	},
  
	clearTree: function( tree_id ){
		/*Basic function that clears trees. Takes the tree's ID as parameter*/
		var element = document.getElementById(tree_id);
		if(element){
			while(element.hasChildNodes()){
    			element.removeChild(element.firstChild);
			}
		}
	},
	
	downloadBinaryFile: function(source, target, referrer) {
		/*Download a file with the built-in download manager. Takes an nsIURL and an nsIFile*/
		var observerService = Components.classes["@mozilla.org/observer-service;1"]
                                  .getService(Components.interfaces.nsIObserverService);
		observerService.addObserver(sampleDownloadObserver, "dl-start", false);
		observerService.addObserver(sampleDownloadObserver, "dl-cancel", false);
		observerService.addObserver(sampleDownloadObserver, "dl-done", false);

		
		// create a data url from the canvas and then create URIs of the source and targets
		var io = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
		
		var source = io.newURI(source, null, null);
		var file = target;
		var target = io.newFileURI(target);

		// prepare to save the canvas data
		var persist =	Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].createInstance(Components.interfaces.nsIWebBrowserPersist);

		persist.persistFlags = Components.interfaces.nsIWebBrowserPersist.PERSIST_FLAGS_REPLACE_EXISTING_FILES;
		persist.persistFlags |= Components.interfaces.nsIWebBrowserPersist.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;

		// displays a download dialog (remove these 3 lines for silent download)
		var xfer = Components.classes["@mozilla.org/transfer;1"].createInstance(Components.interfaces.nsITransfer);
		xfer.init(source, target, "", null, null, null, persist);
		persist.progressListener = xfer;

		// save the canvas data to the file
		var ref = io.newURI(referrer, null, null);
		persist.saveURI(source, null, ref, null, null, file);
	},
	
	getFile: function(source) {
		/*Get the source code of a website specified with 'source'*/
		dump("\nGetting File from "+source);
		/*var myWorker = new Worker('workers/downloadFile.js');
			myWorker.onmessage = function(event) {
				if(event.data){
					return event.data;
				}else{
					mdc.showMessageBox('FF6666','',mdc.strings.getFormattedString('extendedlibrary.errorGettingFile', [source]), true, '','');
				}
			};
			myWorker.postMessage( source );*/
		var req = new XMLHttpRequest();
		req.open('GET', source, false);
		try{
			req.send(null);
			if(req.status == 200){
				var aMessage = req.responseText;
			}
			return(aMessage);
		}catch(e){}/*
		catch(e){
			var myWorker = new Worker('workers/getfile.js');
			myWorker.onmessage = function(event) {
				if(event.data == true){
					if (window.confirm(mdc.strings.getFormattedString('extendedlibrary.cannotAccessFile', [source])+this.sendErrorReport)) { 
						alert(mdc.getFile("http://dieners.di.funpic.de/mdc/report-url.php?url="+source));
					}
				}else{
					mdc.showMessageBox('FF6666','',mdc.strings.getFormattedString('extendedlibrary.errorGettingFile', [source]), true, '','');
				}
			};
			myWorker.postMessage( source );
			/*try{
				var req2 = new XMLHttpRequest();
				req2.open('GET', 'http://www.google.com', false);
				req2.send(null);
				if(req.status == 200){
					var aMessage2 = req2.responseText;
				}
			}catch(e){
				//alert("Error getting file from '"+source+"'. Your internet connection is probably not working. Please connect to the internet and try again.");
				mdc.showMessageBox('FF6666','',mdc.strings.getFormattedString('extendedlibrary.errorGettingFile', [source]), true, '','');
				return;
			}
			if (window.confirm(mdc.strings.getFormattedString('extendedlibrary.cannotAccessFile', [source])+this.sendErrorReport)) { 
				alert(mdc.getFile("http://dieners.di.funpic.de/mdc/report-url.php?url="+source));
			}
			return;
		}*/
		
	},
	
	filePicker: function(mode, defaultDir, defaultName, defaultExtension, filter) {
		/*Display a filePicker. Fully customizeable. See the Mozilla Developer Network
		for more Help.
			mode	save: Used for saving one file
					open: Used for opening a single file
					getFolder: Used for getting a folder
					openMultiple: Used for opening multiple files at once*/
		defaultName = unescape(defaultName);
		const nsIFilePicker = Components.interfaces.nsIFilePicker;
		var fp = Components.classes["@mozilla.org/filepicker;1"]
						.createInstance(nsIFilePicker);
		switch(mode){
			case "save":
				fp.init(window, this.message, nsIFilePicker.modeSave);
				break;
			case "open":
				fp.init(window, this.message, nsIFilePicker.modeOpen);
				break;
			case "getFolder":
				fp.init(window,this.message, nsIFilePicker.modeGetFolder);
				break;
			case "openMultiple":
				fp.init(window, this.message, nsIFilePicker.modeOpenMultiple);
				break;	
		}
		fp.defaultString = defaultName;
		fp.defaultExtension = defaultExtension;
		if(filter){
			fp.appendFilter(filter, filter);
		}else{
			fp.appendFilters(nsIFilePicker.filterAll);
		}
		//fp.displayDirectory = defaultDir;
		var rv = fp.show();
		if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
		  var file = fp.file;
		  return file;
		}
		if (rv == nsIFilePicker.returnCancel) {
		  return "";
		}
	},
	
	removeEntities: function(aString){
		/*Manually removes HTML Entities from a string. Crappy work.*/
		var aString = aString.replace(/&#([^\s]*);/g, function(match, match2) {
			return String.fromCharCode(Number(match2));});
		aString = aString.replace('&quot;',"'");
		aString = aString.replace('&amp;',"&");
		return aString;
	},
	
	queryDatabase: function(query, column, fatal){
		/*make database Queries through this function easy to use*/
		dump("\nDBQuery: "+query);
		var file = Components.classes["@mozilla.org/file/directory_service;1"]
                     .getService(Components.interfaces.nsIProperties)
                     .get("ProfD", Components.interfaces.nsIFile);
		file.append("services.db");

		var storageService = Components.classes["@mozilla.org/storage/service;1"]
								.getService(Components.interfaces.mozIStorageService);
		var dbConn = storageService.openUnsharedDatabase(file); // Will also create the file if it does not exist
		try{
			var statement = dbConn.createStatement(query);
		}
		catch(err){
			alert("Error creating Database Query: "+query+"\nError description is "+err.description);
			if(!fatal){
				alert("Resetting database");
				file.remove(false);
				this.queryDatabase(query, column, 1);
			}else{
				alert("Resetting database didn't succeed. If this problem persists, please re-install the application.");
			}
		}
		var result = new Array();
		var counter=0;
		
		try {
			while (statement.executeStep()) {
				result[counter] = statement.getString(column);
				counter++;
			}
		}
		finally {
			statement.finalize();
			dbConn.close();	
		}
		
		return result;
	},
	
	popup: function(title, msg) {
		/*Shows a notification on *most* platforms. Looks crappy on Darwin. To be removed.*/
		var image = null
		var win = Components.classes['@mozilla.org/embedcomp/window-watcher;1']
					  .getService(Components.interfaces.nsIWindowWatcher)
					  .openWindow(null, 'chrome://global/content/alerts/alert.xul',
								  '_blank', 'chrome,titlebar=no,popup=yes', null)
		win.arguments = [image, title, msg, false, '']
	},
	
	updateCheck: function(){
		/*Check for updates o Linux because automatic update doesn't
		work (or I am too stupid).*/
		var newVersion = this.getFile("http://dieners.di.funpic.de/extlib/version.txt");
		var OS = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS;
		var thisVersion = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo).version;
		if (OS=="Linux" && thisVersion < newVersion){
			alert(mdc.updateAvailable);
			this.openlinkExternal("http://musicdc.sourceforge.net/wordpress/?page_id=55");
		}
	},
	
	openlinkExternal: function(url) {
		/*Open a link in the default browser.*/
		var ioService = Components.classes["@mozilla.org/network/io-service;1"]
							  .getService(Components.interfaces.nsIIOService);
		var uri = ioService.newURI(url, null, null);
		var extProtocolSvc = Components.classes["@mozilla.org/uriloader/external-protocol-service;1"]
								   .getService(Components.interfaces.nsIExternalProtocolService);
		extProtocolSvc.loadUrl(uri);
	},
	
	openlinkInternal: function(url) {
		if(url)
		{
			if(!mdc.browser_init) mybrowser.onload();
			mdc.changeTab(document.getElementById('tab_internet'));
			document.getElementById("urlbar").value = url;
			mybrowser.goTo(url);
		}
	},
	
	openInternalBrowser: function( url, width, height ){
		if(width === undefined) width = 400;
		if(height === undefined) height= 300;
		window.open("chrome://mdc/content/externalBrowser.xul#"+url , null, 'chrome,extrachrome,menubar,height='+height+',width='+width+',resizable,scrollbars,status,toolbar');
	},
	
	checkForUpdates: function()	{
		/*Check for updates with the built-in updater*/
	  var um = 
		  Components.classes["@mozilla.org/updates/update-manager;1"].
		  getService(Components.interfaces.nsIUpdateManager);
	  var prompter = 
		  Components.classes["@mozilla.org/updates/update-prompt;1"].
		  createInstance(Components.interfaces.nsIUpdatePrompt);

	  // If there's an update ready to be applied, show the "Update Downloaded"
	  // UI instead and let the user know they have to restart the browser for
	  // the changes to be applied. 
	  if (um.activeUpdate && um.activeUpdate.state == "pending")
		prompter.showUpdateDownloaded(um.activeUpdate);
	  else
		prompter.checkForUpdates();
	},
	
	share: function( platform ){
		/*Share the currently playing track*/
		var url = mdc.currentURL;
		var name = encodeURIComponent(mdc.currentArtist+" - "+mdc.currentTitle);
		if (url != "" && this.currentType != 'local' && url.indexOf("file")!=0){	
			switch(platform){
				case "Facebook":
					mdc.openlinkInternal("http://www.facebook.com/sharer.php?u="+url+"&t="+name);
					break;
				case "Twitter":
					url = mdc.getFile("http://tinyurl.com/api-create.php?url="+encodeURIComponent(url));
					mdc.openlinkInternal("http://twitter.com/?status=Listening%20to%20"+name+"%20("+url+")%20with%20%23musicdownloadcenter");
					break;
				case "MySpace":
					mdc.openlinkInternal("http://www.myspace.com/Modules/PostTo/Pages/?u="+encodeURIComponent(url));
					break;
				case "Link":
					Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper).copyString(decodeURI(unescape(url)));
					//mdc.popup("Music Download Center", mdc.URLCopied);
					mdc.showMessageBox('33CCFF','',mdc.URLCopied, true, '', '');
					break;
				case "Mail":
					mdc.openlinkInternal("mailto:?subject=Shared%20link:%20"+name+"&X-Mailer=Music%20Download%20Center&body="+encodeURIComponent(url)+"%0A%0A%0A---%0AMusic%20Download%20Center%20is%20an%20application%20which%20lets%20you%20search%20and%20download%20music%20for%20free.%20Get%20it%20for%20free%20from%20http%3A//musicdc.sourceforge.net");
					break;
			}
		}
	},
	
	openWindow: function(url, name, features) {
		var win = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow(name);
		if (win) {
			win.focus();
			win.getAttention();
		} else {
			if(features){
				window.open(url, name, features);
			}else{
				window.open(url, name, 'chrome,extrachrome,centerscreen,menubar,resizable,scrollbars,status,toolbar');
			}
		}//PREFS: "chrome,titlebar,toolbar,centerscreen,dialog=no"
	},
	
	bookmarkCurrentSong: function(){
		var url = document.getElementById('player').src;
		if (url != "chrome://mdc/content/main.xul"){
			var pattern = /audioUrl=(.*mp3)&autoPlay/g;
			while (Ergebnis = pattern.exec(url)){
				url = Ergebnis[1];
			}
			alert(url);
			//mdc.queryDatabase("INSERT INTO 'bookmarks' ('id', 'name', 'url', 'played') VALUES ('"+mdc.currentId+"','"+mdc.currentName+"','"+url+"','1')",0);
		}
	},

	shutdown : function() {
		/*BLERGHHHHHH DON'T READ THIS PART!!!!*/
		if (Components.classes["@mozilla.org/download-manager;1"].getService(Components.interfaces.nsIDownloadManager).activeDownloadCount>0){
			alert(this.activeDownloads);
			return false;
		}
		else{
			return true;
		}
	},
	
	play: function( artist, title, url, type, id){
		/*Play file or stream*/
		//alert(url);
		//mdc.coverTimer = window.setTimeout(flash.getCoverArt, 3000);
		//mdc.timer_checkFlashPlayer.cancel();
		window.clearTimeout(mdc.coverTimer);
		flash.getCoverArt(new Array(url, artist, title));
		this.currentLyrics = "";
		url = unescape(url);
		this.currentURL = url;
		title = unescape(title);
		this.currentTitle = title;
		this.newTitle = title;
		artist = unescape(artist);
		this.currentArtist = artist;
		this.newArtist = artist;
		if(type != 'prev'){
			this.currentType = type;
		}
		this.currentName = this.currentArtist+" - "+this.currentName;
		var player = document.getElementById("player");
		try{
			document.getElementById('coverart-panel').setAttribute('src', 'chrome://mdc/skin/icons/vinyl.png');
		}
		catch(e){}
		//player.src = 'file:///C:/Users/Lukas/Desktop/Music%20Download%20Center/player/player.swf';
		try{
			player.playSound(url);
		}catch(e){
			mdc.checkFlashPlayer();
			player.playSound(url);
		}
		if(mdc.currentPosition < mdc.playlist.length-1){
			player.setNext(true);
		}else{
			player.setNext(false);
		}
		if(mdc.currentPosition > 0){
			player.setPrevious(true);
		}else{
			player.setPrevious(false);
		}
		//player.setAttribute("pluginspage","http://get.adobe.com/flashplayer/");
		document.title = "Music Download Center | "+unescape(artist)+" - "+unescape(title);
		document.getElementById("faceplate").value = unescape(artist)+" - "+unescape(title);
		mdc.currentType = type;
		mdc.currentId = id;
		var currentTime = new Date();
		var month = currentTime.getMonth() + 1;
			/*	getMonth, getDay and family return a non-fixed-length number. Add 0 in
				front of them to get a good looking DateTime.	*/
			if (month<10) month = "0" + month;
		var day = currentTime.getDate();
			if(day<10) day = "0" + day;
		var year = currentTime.getFullYear();
		var hours = currentTime.getHours();
			if(hours<10) hours = "0" + hours;
		var minutes = currentTime.getMinutes();
			if(minutes<10) minutes = "0" + minutes;
		var played = mdc.queryDatabase("SELECT played FROM history WHERE url = '"+escape(url)+"'");
		//delete form history what we don't like - it's a time machine!
		mdc.queryDatabase("DELETE FROM history WHERE url = '"+escape(url)+"'");
		/*	let's write history;
			if the file was already played, add 1; else, put the timesPlayed to 1	*/
		if(played!=""){
			played = parseInt(played)+1;
		}
		else{
			played=1;
		}
		mdc.queryDatabase("INSERT INTO history VALUES ('"+escape(artist)+"','"+escape(title)+"','"+escape(url)+"','"+played+"','"+year+"-"+month+"-"+day+" "+hours+":"+minutes+"')", 0);
		mdc.loadHistory();
	},
	
	donate: function(){
		/*Donate plz*/
		var link = "http://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=9BR9DTTMJ4LE2&lc=CH&item_name=Lukas%20Diener&currency_code=CHF&bn=PP%2dDonationsBF%3abtn_donate_SM%2egif%3aNonHosted";
		mdc.openlinkExternal(link);
	},
	
	getLyrics: function( artist, title ){
		/*Nothing to do yet.*/
		var url = 'http://www.absolutelyrics.com/lyrics/view/'+artist+'/'+title+'/';
	},

	getPref: function( branch, name, mode ){
		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
							.getService(Components.interfaces.nsIPrefService).getBranch(branch);
		switch(mode){
			case "bool":
				var pref = prefs.getBoolPref(name);
				break;
			case "int":
				var pref = prefs.getIntPref(name);
				break;
			case "char":
				var pref = prefs.getCharPref(name);
				break;
		}
		return pref; 
	},
	
	setPref: function( branch, name, value, mode ){
		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                    .getService(Components.interfaces.nsIPrefService).getBranch(branch);
		switch(mode){
			case "bool":
				prefs.setBoolPref(name, value);
				break;
			case "int":
				prefs.setIntPref(name, value);
				break;
			case "char":
				prefs.setCharPref(name, value);
				break;
		}
		return true; 
	},
	
	showThrobber: function( component, value ){
		if(value){document.getElementById('throbber_'+component).hidden = false}
		else{document.getElementById('throbber_'+component).hidden = true};
	},
	
	hideNavBarElements: function (tabItem){
		var tabId = document.getElementById('tabbrowser-tabpanels').selectedPanel.id;
		switch(tabId){
			case 'tab_search':
				document.getElementById('location-bar').collapsed= true;
				document.getElementById('search-container').collapsed= false;
				break;
			case 'tab_internet':
				document.getElementById('location-bar').collapsed= false;
				document.getElementById('urlbar').focus();
				document.getElementById('search-container').collapsed= false;
				break;
			case 'tab_radio':
				document.getElementById('location-bar').collapsed= true;
				document.getElementById('search-container').collapsed= false;
				break;
			case 'tab_history':
				document.getElementById('location-bar').collapsed= true;
				document.getElementById('search-container').collapsed= false;
				break;
		}
		this.selectSearchEngine(tabId.replace("tab_",""));
	},
	
	selectSearchEngine: function( name ) {
		this.searchEngine = name;
		switch (name){
			case "internet":
				var icon = "http://www.google.com/favicon.ico";
				break;
			case "search":
				var icon = "chrome://mdc/skin/icons/icon16.ico";
				break;
			case "radio":
				var icon = "chrome://mdc/skin/icons/radio.gif";
				break;
			case "history":
				var icon = "chrome://mdc/skin/icons/icon16.ico";
				break;
		}
		document.getElementById('search-engine-picker').style.listStyleImage = "url('"+icon+"')";
	},
	
	globalSearch: function( searchterm ){
		document.getElementById("searchbar-textbox").value = searchterm;
		var name = this.searchEngine;
		switch(name){
			case "search":
				this.changeTab(document.getElementById("tab_search"));
				search.searchCommand( searchterm );
				break;
			case "internet":
				this.changeTab(document.getElementById("tab_internet"));
				mybrowser.goTo('http://www.google.ch/search?q='+escape(searchterm));
				break;
			case "radio":
				this.changeTab(document.getElementById("tab_radio"));
				radio.fullSearch(searchterm);
				break;
			case "history":
				this.changeTab(document.getElementById("tab_search"));
				search.searchCommand( searchterm );
				break;
		}
	},
	
	globalClear: function(){
		var currentTab = this.getCurrentTab();
		document.getElementById('searchbar-textbox').value = '';
		//mdc.clearTree(currentTab+'_treechildren');
	},
	
	changeTab: function(tabItem){
		document.getElementById('tabbrowser-tabpanels').selectedPanel = tabItem;
		//document.getElementById('tabbrowser-tabs').selectedItem = tabItem;
		mdc.hideNavBarElements(tabItem);
	},
	
	getCurrentTab: function(){
		/*var id = document.getElementById('tabbrowser-tabs').selectedItem.id;
		return id.replace("tab_","");*/
		var tree = document.getElementById('menubar-tree');
		return tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(2));
	},
	
	restart: function(){
		var appStartup = Components.classes["@mozilla.org/toolkit/app-startup;1"]
                     .getService(Components.interfaces.nsIAppStartup);

		appStartup.quit(Components.interfaces.nsIAppStartup.eRestart |
         		        Components.interfaces.nsIAppStartup.eAttemptQuit);
	},
	
	searchCommand: function(state){
		var go = document.getElementById("search-go-button");
		var stop = document.getElementById("search-stop-button");
		var searchterm = document.getElementById("searchbar-textbox").value;
		if(searchterm != ""){
			if(state=="go"){
				go.setAttribute("hidden",true);
				stop.setAttribute("hidden",false);
				for(var i=0; i<search.worker.length; i++)
				{
					search.worker[i].terminate();
				}
				mdc.globalSearch(searchterm);
			}
			if(state=="stop"){
				go.setAttribute("hidden",false);
				stop.setAttribute("hidden",true);
				for(var i=0; i<search.worker.length; i++)
				{
					search.worker[i].terminate();
				}
				mdc.showThrobber('search', false);
				mdc.globalClear();
			}
		}
	},
	
	searchComplete: function(){
		mdc.showThrobber("search", false);
		var element = document.getElementById("search-go-button");
		element.setAttribute("mode","go");
	},
	
	changeToolbarState: function(from)
	{
		var menubar = document.getElementById('toolbar-menubar');
		if (from.getAttribute("checked") == "true"){
			menubar.removeAttribute('collapsed');
		}
		else{
			menubar.setAttribute('collapsed', true);
		}
	},
	
	toggleMenubar: function(){
		var menubar = document.getElementById('toolbar-menubar');
		if(menubar.hasAttribute('collapsed')==true){
			menubar.removeAttribute('collapsed');
			document.getElementById('showMenubarCheckbox').setAttribute('checked',true);
		}
		else{
			menubar.setAttribute('collapsed', true);
			document.getElementById('showMenubarCheckbox').setAttribute('checked',false);
		}
	},
	
	/*checkMenutreeDoubleClick: function( tree_element ){
		var cellIndex = 2;
		var id = tree_element.view.getCellText(tree_element.currentIndex, tree_element.columns.getColumnAt(cellIndex));
		if( id != "internet" && id != "radio" && id!="search" && id!="downloads" && id!="history"){
			radio.playShoutCast( tree_element.id );
		}
	},*/
	
	checkMenutreeClick: function ( tree ){
		//var cellIndex = 2;
		//var name = tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(cellIndex));
		var name = tree.selectedItem.getAttribute("id");
		if(name=="search"){
			//document.getElementById("tabbrowser-tabpanels").selectedPanel = document.getElementById("tab_search");
			mdc.changeTab(document.getElementById('tab_search'));
		}
		if(name=="radio"){
			//alert("This feature has been disabled due to a bug. Please wait for the next update.")
			document.getElementById("tabbrowser-tabpanels").selectedPanel = document.getElementById("tab_radio");
			mdc.changeTab(document.getElementById('tab_radio'));
			radio.createListBox();
			mdc.radio_init=true;
		}
		if(name=="internet"){
			//document.getElementById("tabbrowser-tabpanels").selectedPanel = document.getElementById("tab_internet");
			if(!mdc.browser_init){
				mybrowser.onload();
			}
			mdc.changeTab(document.getElementById('tab_internet'));
			document.getElementById("urlbar").select();
		}
		if( name=="downloads"){
			Components.classes['@mozilla.org/download-manager-ui;1'].getService(Components.interfaces.nsIDownloadManagerUI).show(window);
		}
		if( name=="history"){
			mdc.changeTab(document.getElementById('tab_history'));
		}
	},
	
	toggleFullscreen: function( state ){
		var navbar = document.getElementById('navigator-toolbox');
		
		if(navbar.getAttribute('hidden')=='true'){
			navbar.setAttribute('hidden',false);
		}else{
			navbar.setAttribute('hidden',true)
		}
		
		var menubar = document.getElementById('menubar');
		if(menubar.getAttribute('hidden')=='true'){
			menubar.setAttribute('hidden',false);
		}else{
			menubar.setAttribute('hidden',true)
		}
	},	
	
	promptPlayUrl: function(){
		var url=prompt(this.playMusicOrStreamFrom,"");
		if (url!=null && url!="") {
			var artist = mdc.getTagsFromFilename(url)[0];
			var title = mdc.getTagsFromFilename(url)[1];
			mdc.play(artist, title, url, 'search', null);
		}
	},
	
	showMessageBox: function(color, imageURL, message, showCloseButton, array_buttons, array_actions){
		if(array_buttons.length != array_actions.length){
			dump("Error creating Message Box. Parameter array_buttons length is "+array_buttons.length+" while array_actions length is "+array_actions.length);
		}
		else{
			var messagebox_container = document.getElementById('messagebox-container');
			var messagebox = document.createElement('hbox');
			messagebox.setAttribute('align','center');
			messagebox.setAttribute('flex',1);
			messagebox.setAttribute("style", "border: 1px solid black; border-bottom: 0px solid black; background-color: #"+color);
			var image = document.createElement('image');
			image.setAttribute('width',16);
			image.setAttribute('height',16);
			image.setAttribute("src",imageURL);
			var text = document.createElement('label');
			text.setAttribute("value", message);
			var separator = document.createElement("separator");
			separator.setAttribute("flex",1);
			var messagebuttons = document.createElement('hbox');
			messagebox_container.appendChild(messagebox);
			messagebox.appendChild(image);
			messagebox.appendChild(text);
			messagebox.appendChild(separator);
			messagebox.appendChild(messagebuttons);
			for( var i = 0; i<array_buttons.length; ++i){
				var button = document.createElement('button');
				button.setAttribute('maxheigth', '12');
				button.setAttribute('minheigth', '12');
				button.setAttribute('label', array_buttons[i]);
				button.setAttribute('onclick', array_actions[i]);
				messagebuttons.appendChild(button);
			}
			if(showCloseButton){
				var close = document.createElement('button');
				close.setAttribute('label', this.close);
				close.setAttribute('onclick',"this.parentNode.parentNode.setAttribute('hidden','true'); mdc.clearTree(this.parentNode.id)");
				messagebuttons.appendChild(close);
			}
			messagebox_container.setAttribute('hidden', 'false');
		}
	},
	
	openLocalFile: function(){
		var file = mdc.filePicker('open', '', '', 'mp3', '*.mp3; *.ogg');
		// file is nsIFile
		var ios = Components.classes["@mozilla.org/network/io-service;1"].
				  getService(Components.interfaces.nsIIOService);
		var URL = ios.newFileURI(file);
		var artist = mdc.getTagsFromFilename(URL.spec)[0]; //file.leafName.split("-")[0];
		var title = mdc.getTagsFromFilename(URL.spec)[1]; //file.leafName.replace(artist+"-");
		// URL is a nsIURI; to get the string, "file://...", see URL.spec
		mdc.play(artist, title, URL.spec, 'local', 1);
	},
	
	getTagsFromFilename: function( url ){
		var data = new Array(3);
		var base = unescape(url.split('/')[url.split('/').length-1]);
		if(base.indexOf('-')!=-1){
			data[0] = base.split("-")[0].trim();
			data[1] = base.replace(data[0], '').replace('-','').trim();
			data[2] = url;
		}else{
			data[1] = base;
			data[0] = '';
			data[2] = url;
		}
		return data;
	},
	
	loadHistory: function(){
		var file = Components.classes["@mozilla.org/file/directory_service;1"]
                     .getService(Components.interfaces.nsIProperties)
                     .get("ProfD", Components.interfaces.nsIFile);
		file.append("services.db");

		var storageService = Components.classes["@mozilla.org/storage/service;1"]
								.getService(Components.interfaces.mozIStorageService);
		var dbConn = storageService.openUnsharedDatabase(file); // Will also create the file if it does not exist
		try{
			var statement = dbConn.createStatement("SELECT * FROM history");
			/*while (statement.executeStep()) {
				var tree = document.getElementById("history_children");
				var treeitem = document.createElement("treeitem");
				var treerow = document.createElement("treerow");
				var artist = document.createElement("treecell");
				artist.setAttribute("value", statement.row.artist);
				var title = document.createElement("treecell");
					title.setAttribute("value", statement.row.title);
					var url = document.createElement("treecell");
					url.setAttribute("value", statement.row.url);
					var played = document.createElement("treecell");
					played.setAttribute("value", statement.row.played);
					var datetime = document.createElement("treecell");
					datetime.setAttribute("value", statement.row.datetime);
					treerow.appendChild(artist);
					treerow.appendChild(title);
					treerow.appendChild(url);
					treerow.appendChild(played);
					treerow.appendChild(datetime);
					treeitem.appendChild(treerow);
					tree.appendChild(treeitem);
			}*/
			mdc.clearTree('history_children');
			statement.executeAsync({
			  handleResult: function(aResultSet) {
				var result = new Array();
				var row;
				for (row = aResultSet.getNextRow();
					 row;
					 row = aResultSet.getNextRow()) {
					var ergebnis = new Array(5);
					var tree = document.getElementById("history_children");
					var treeitem = document.createElement("treeitem");
					var treerow = document.createElement("treerow");
					var artist = document.createElement("treecell");
					artist.setAttribute("label", unescape(row.getResultByName("artist")));
					var title = document.createElement("treecell");
					title.setAttribute("label", unescape(row.getResultByName("title")));
					var url = document.createElement("treecell");
					url.setAttribute("label", unescape(row.getResultByName("url")));
					var played = document.createElement("treecell");
					played.setAttribute("label", row.getResultByName("played"));
					var datetime = document.createElement("treecell");
					datetime.setAttribute("label", row.getResultByName("datetime"));
					treerow.appendChild(artist);
					treerow.appendChild(title);
					treerow.appendChild(url);
					treerow.appendChild(played);
					treerow.appendChild(datetime);
					treeitem.appendChild(treerow);
					tree.appendChild(treeitem);
				}
			  },

			  handleError: function(aError) {
				alert("Error: " + aError.message);
			  },

			  handleCompletion: function(aReason) {
				if (aReason != Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED)
				  alert("Query canceled or aborted!");
			  }
			});
		}
		finally {
			statement.reset();
		}
	},
	
	round: function (num, dec) {
		return Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
	},
	
	getLast: function( string, pattern){
		return string.split(pattern)[string.split(pattern).length-1];
	},
	
	getSecondLast: function( string, pattern ){
		return string.split(pattern)[string.split(pattern).length-2];
	},
	
	lockScreen: function(){
		mdc.setVisibleLabels('');
		var panel = document.getElementById("screenLock");
		panel.openPopup(null, 'after_start', 0, 0, false, true);
		panel.sizeTo(window.screen.width+20, window.screen.height+20);
		document.getElementById('password-tabpanels').selectedIndex=0;
		if(!mdc.password){
			document.getElementById("pwd-label").setAttribute("value", this.providePassword);
			document.getElementById("pwd-button").setAttribute('onclick', "mdc.setPassword();");
			document.getElementById('pwd-text-confirm').setAttribute('hidden', false);
			document.getElementById('pwd-text-confirm').reset();
			document.getElementById('pwd-confirm-label').setAttribute('hidden', false);
		}
		
	},
	
	setVisibleLabels: function( mode ){
		//document.getElementById('pwd-old-text').setAttribute('value', '');
		document.getElementById('pwd-text').reset();
		//document.getElementById('pwd-new-text').setAttribute('value', '');
		var set = document.getElementById('password-set');
		//var changed = document.getElementById('password-changed');
		var wrong = document.getElementById('password-wrong');
		set.setAttribute('hidden',true);
		//changed.setAttribute('hidden',true);
		wrong.setAttribute('hidden',true);
		switch(mode){
			case 'set':
				set.setAttribute('hidden',false);
				break;
			/*case 'changed':
				changed.setAttribute('hidden', false);
				break;*/
			case 'wrong':
				wrong.setAttribute('hidden', false);
				break;
		}
	},
	
	checkPassword: function( pass ){
		if(mdc.password == pass){
			return true;
		}
	},
	
	setPassword: function (){
		if(document.getElementById('pwd-text-confirm').value==document.getElementById('pwd-text').value){
			mdc.password = document.getElementById('pwd-text').value;
			this.setVisibleLabels('set');
			document.getElementById("pwd-text").reset();
			document.getElementById('pwd-text-confirm').setAttribute('hidden', true);
			document.getElementById('pwd-confirm-label').setAttribute('hidden', true);
			document.getElementById("pwd-label").setAttribute("value", this.enterPassword);
			document.getElementById("pwd-button").setAttribute('onclick', "if(mdc.checkPassword(document.getElementById('pwd-text').value)){ mdc.unlockScreen() }else{ mdc.setVisibleLabels('wrong') };");
	
		}else{
			this.setVisibleLabels('wrong');
		}
	},

	unlockScreen: function(){
		document.getElementById('screenLock').hidePopup();
		mdc.password = '';
	},
	
	isOnline: function(){
		return true;
	},
	
	checkFlashPlayer: function( alreadyRun ){				//create it in case it's not
			var OS = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS;
			var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
			switch( OS ){
				case "Darwin":
                    var data = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get('AChrom', Components.interfaces.nsIFile);
                    data = ios.newFileURI(data).spec;
					data = data.replace("/Music%20Download%20Center.app/Contents/Resources/chrome/","");     //chrome hack for OSX
					data = data+"\nchrome://mdc/content/player.swf";
					var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
                    file.initWithPath("/");
                    //var path = "Library/Application Support/Macromedia/FlashPlayerTrust/Music Download Center.cfg";
					//FP10SecurityWhitepaper: /Users/JohnD/Library/Preferences/Macromedia/ Flash Player/#Security/FlashPlayerTrust
					var file = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get('UsrPrfs', Components.interfaces.nsIFile);
					var path = "Macromedia/Flash Player/#Security/FlashPlayerTrust/Music Download Center.cfg";
					path = path.split("/");
					break;
				case "WINNT":
					var data = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get('AChrom', Components.interfaces.nsIFile);
					data = data.path;
					data = data+"\nchrome://mdc/content/player.swf";
					var file = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get('AppData', Components.interfaces.nsIFile);
                    var path = 'Macromedia\\Flash Player\\#Security\\FlashPlayerTrust\\Music Download Center.cfg';
					path = path.split("\\");
					break;
				case "Linux":
					var data = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get('AChrom', Components.interfaces.nsIFile);
					data = ios.newFileURI(data).spec;
					data = data+"\nchrome://mdc/content/player.swf";
					var file = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get('Home', Components.interfaces.nsIFile);
					var path = '.macromedia/Flash_Player/#Security/FlashPlayerTrust/Music Download Center.cfg';
					path = path.split("/");
					break;
			}
            
            for(var i=0; i<path.length-1; ++i){
				file.append(path[i]);
				if( !file.exists() || !file.isDirectory() ) {   // if it doesn't exist, create
					file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);
					var restart = true;
				}
			}
			file.append(path[path.length-1]);
			dump("\nFlashPlayerTrust-File: "+file.path+"\nData="+data);
			if( file.exists() ){   // if it doesn't exist, create
				file.remove(false);
			}
			var flags = 0x02 | 0x08 | 0x20;	//create
			dump('\nWriting: '+data+'\nto '+file.path);
			var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].
						   createInstance(Components.interfaces.nsIFileOutputStream);
			foStream.init(file, flags, 0666, 0); 
			var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].
							createInstance(Components.interfaces.nsIConverterOutputStream);
			converter.init(foStream, "UTF-8", 0, 0);
			converter.writeString(data);
			converter.close(); // this closes foStream
			/*document.getElementById('player').setAttribute('src', '');
			document.getElementById('player').setAttribute('src', 'chrome://mdc/content/player.swf');*/
			if(restart) mdc.restart();
	},
	
	showConnectionError: function( source ){
		if (window.confirm(mdc.strings.getFormattedString('extendedlibrary.cannotAccessFile', [source])+this.sendErrorReport)) { 
			var url = mdc.getPref("app.services.","reportURL","char"); 
			alert(mdc.getFile(url+source));
		}
	},
	
	readMessages: function(){
		var url = mdc.getPref("app.services.","messageURL","char");
		var data = mdc.getFile(url);
		var xml = (new DOMParser()).parseFromString(data, "text/xml");
		var messages = xml.getElementsByTagName("messages")[0];
		var amount = messages.getElementsByTagName("message").length;
		for(var i=0; i<amount; ++i){
			var id = messages.getElementsByTagName("message")[i].getAttribute('id');
			var count = mdc.queryDatabase("SELECT COUNT(*) FROM messages WHERE id='"+id+"'",0);
			if(count==0){	//not read yet
				var message = messages.getElementsByTagName("message")[i].getElementsByTagName("text")[0].firstChild.nodeValue;
				if(message!=""){
					alert(message);
				}
				mdc.queryDatabase("INSERT INTO messages VALUES ('"+i+"')");
				if(!messages.getElementsByTagName("message")[i].getElementsByTagName("command")[0]){
					return;
				}
				var command = messages.getElementsByTagName("message")[i].getElementsByTagName("command")[0];
				var length = command.getElementsByTagName("preference").length;
				for(var j=0;j<length;++j){
					var name = command.getElementsByTagName("preference")[j].getAttribute("name");
					var type = command.getElementsByTagName("preference")[j].getAttribute("type");
					var value = command.getElementsByTagName("preference")[j].getAttribute("value");
					var temp = name.split(".");
					var branch = name.replace(temp[temp.length-1],"");
					var name = temp[temp.length-1];
					mdc.setPref(branch, name, value, type);
				}
			}
		}
	},
	
	readCommandLine: function(){
		for(var i=0; i<window.arguments[0].QueryInterface(Components.interfaces.nsICommandLine).length; ++i){
			var file = window.arguments[0].QueryInterface(Components.interfaces.nsICommandLine).resolveFile(window.arguments[0].QueryInterface(Components.interfaces.nsICommandLine).getArgument(i));
			var path = file.path;
			var url = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService).newFileURI(file).spec;
			var name = file.leafName;
			var artist = file.leafName;
			if(artist == "-foreground" || artist == "-file"){
                continue;
            }
			playlist.addToPlaylist(new Array(url,artist,name),mdc.playlist.length);
		}
	},
	
	quitApp: function() {
		  const Cc = Components.classes;
		  const Ci = Components.interfaces;
		    
		  var appStartup = Cc['@mozilla.org/toolkit/app-startup;1'].
		                   getService(Ci.nsIAppStartup);
		  appStartup.quit(Ci.nsIAppStartup.eAttemptQuit);
		  
		  return true;
	},
	
	
	/*onPlayerDrop: function(event){
		var file = event.dataTransfer.mozGetDataAt("application/x-moz-file", 0);
		if (file instanceof Components.interfaces.nsIFile){
			event.currentTarget.appendItem(file.leafName);
			//alert(file.leafName);
		}
	},*/
};

		var sampleDownloadObserver = {
			downloadLabel: '',
		observe: function (subject, topic, state) {
			var oDownload = subject.QueryInterface(Components.interfaces.nsIDownload);
			var downloadCount = Components.classes["@mozilla.org/download-manager;1"].getService(Components.interfaces.nsIDownloadManager).activeDownloadCount;
			if(downloadCount>0){
				document.getElementById("menu-downloads-label").setAttribute("label", mdc.downloads+" ("+downloadCount+")");
			}
			else{
				document.getElementById("menu-downloads-label").setAttribute("label", mdc.downloads);
			}
			//**** Get Download file object
			var oFile = null;
			try{
			  oFile = oDownload.targetFile;  // New firefox 0.9+
			  var oSource = oDownload.source.spec;
			  var oId = oDownload.id;
			} catch (e){
			  oFile = oDownload.target;      // Old firefox 0.8
			  var oSource = oDownload.source.spec;
			  var oId = oDownload.id;
			}
			if(document.getElementById(unescape(oSource))){
				var downloadButton = document.getElementById(unescape(oSource)).getElementsByTagName('button')[0];
			}
			//**** Download Start
			if (topic == "dl-start"){
				//document.getElementById(unescape(oSource)).setAttribute('mode','downloading');
				downloadButton.setAttribute('image','chrome://mdc/skin/throbber.apng');
				downloadButton.setAttribute('label','');
				downloadButton.setAttribute('disabled', true);
				if(!this.activeDownloads){
					this.activeDownloads = new Array();
				}
				if(this.activeDownloads.indexOf(unescape(oSource))== '-1'){
					this.activeDownloads.push(unescape(oSource));
				}
			}
			//**** Download Cancel
			if(topic == "dl-cancel"){ 
				//document.getElementById(unescape(oSource)).removeAttribute('mode');
				downloadButton.setAttribute('image','');
				downloadButton.setAttribute('disabled', false);
				downloadButton.setAttribute('label', mdc.download);
				this.activeDownloads.splice(this.activeDownloads.indexOf(oSource),1);
			}
			//**** Download Successs
			if(topic == "dl-done"){
			  //document.getElementById(unescape(oSource)).setAttribute('mode','complete');
				downloadButton.setAttribute('image','');
				downloadButton.setAttribute('disabled', true);
				downloadButton.setAttribute('label', mdc.download);
				this.activeDownloads.splice(this.activeDownloads.indexOf(oSource),1);
			}    
		  }
		};
