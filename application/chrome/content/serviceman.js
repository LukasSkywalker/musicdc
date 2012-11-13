/* This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Creative Commons
 * Attribution-NonCommercial-ShareAlike Version 3.0, as published
 * by Creative Commons. See 
 * http://creativecommons.org/licenses/by-nc-sa/3.0/legalcode for
 * more details. */ 

var serviceman= {
	onload: function(){
		serviceman.loadServices();
		window.getAttention();
		serviceman.openPrefPane()
	},
	
	loadServices: function(){
		/*Initialization of the service manager (strings and stuff). Basic drawing of
		the User Interfaces (Listbox). Pros and Cons are blank for start.*/
		var strings = document.getElementById("extendedlibrary-strings");
		this.noServiceSelected = strings.getString('extendedlibrary.noServiceSelected');
		this.about = strings.getString('extendedlibrary.about');
		
		document.getElementById("advantages").value = this.noServiceSelected;
		document.getElementById("disadvantages").value = this.noServiceSelected;
		serviceman.compareSources();
		
		var servicelist = document.getElementById('listbox');
		if(servicelist){			//check if current view is Extlib or Serviceman (looking for Serviceman, otherways servicelist==undefined)
			while(servicelist.hasChildNodes()){
				servicelist.removeChild(servicelist.childNodes[0]);
			}
			var services = mdc.queryDatabase("SELECT * FROM offline" , 0);
			for(var i=0; i<services.length;++i){
				var listBox = document.getElementById("listbox");
				var listItem = document.createElement("listitem");
				listItem.setAttribute("label",services[i]);
				listItem.setAttribute("type","checkbox");
				if(mdc.queryDatabase("SELECT * FROM offline WHERE name='"+services[i]+"'",1)==1){
					listItem.setAttribute("checked", true);
				}
				listItem.setAttribute("id",services[i]);
				var query_enable = "UPDATE offline SET enabled='1' WHERE name='"+services[i]+"'";
				var query_disable = "UPDATE offline SET enabled='0' WHERE name='"+services[i]+"'";
				listItem.setAttribute("onclick", 'if(this.checked){ mdc.queryDatabase("'+query_enable+'") }else{ mdc.queryDatabase("'+query_disable+'") }');
				listBox.appendChild(listItem);
			}
		}
	},

	updateProperties: function(serviceName){
		/*Gets and sets the properties (advantages/disadvantages) from the services. Fetching services from online.*/
		var url = mdc.getPref("app.services.","workerURL","char");
		var aCode = mdc.getFile(url+serviceName);
		document.getElementById("about").value = this.about+" "+serviceName.replace(".js","");
		var proRegExp=new RegExp("\/\/PRO:(.*?)%", "g");
		var conRegExp= new RegExp("\/\/CON:(.*?)%", "g");		
		var pro = proRegExp.exec(aCode);
		var con = conRegExp.exec(aCode);
		document.getElementById("advantages").value = pro[1];
		document.getElementById("disadvantages").value = con[1];
		
		var enabled = mdc.queryDatabase("SELECT * FROM offline WHERE name='"+serviceName+"'",1);
		if(enabled == 1){
			document.getElementById(serviceName).setAttribute("checked", true);
		}
		else{
			document.getElementById(serviceName).setAttribute("checked", false);
		}
		document.getElementById(serviceName).disabled = false;
		//document.getElementById(servicename).setAttribute("onclick","serviceman.saveItem('"+serviceName+"')");
	},
	
	compareSources: function(){
		/*Check for every online source if it exists offline and create
		if not. Delete all those offline sources that don't exists
		online (anymore).	*/
		if(mdc.isOnline()){
			var online = serviceman.getOnlineServices();
			var offline = serviceman.getOfflineServices();
			
			dump("\nBEFORE\tOff="+offline.length+"\tOn="+online.length);
			for each (var off_service in offline){
				for each( var on_service in online){
					if( off_service == on_service ){
						var temp=true;
					}
				}
				if(!temp){
						mdc.queryDatabase("DELETE FROM offline WHERE name='"+off_service+"'",0);
						//mdc.popup("Music Download Center", "Deleted "+off_service);
						mdc.showMessageBox('FF6666','', mdc.strings.getFormattedString('extendedlibrary.deletedService', [off_service.replace('.js','')]), true, '','');
					}
				temp=false;
			}
			for each (on_service in online){
				dump("\ntrying "+on_service);
				var result = mdc.queryDatabase("SELECT * FROM offline WHERE name='"+on_service+"'", 0);
				if (result.length==0){
					var statement = mdc.queryDatabase("INSERT INTO offline VALUES ('"+on_service+"','1')", 0);
					//mdc.popup("Music Download Center", "Added "+on_service);
					mdc.showMessageBox('99FF33','', mdc.strings.getFormattedString('extendedlibrary.addedService', [on_service.replace('.js','')]), true, '','');
				}	
			}		
			dump("\nAFTER\tOff="+offline.length+"\tOn="+online.length);
		}
	},
	
	getOnlineServices: function(){
		/*Gets the online services from the internet*/
		var serviceIndex = mdc.getFile("http://musicdc.sourceforge.net/mdc/services/index.txt");
		var servicesRXP = new RegExp("(.*?.js)", "g");
			if(!serviceIndex.match('services')){
				mdc.showConnectionError( "file:///C:/Users/Lukas/Desktop/index.txt" );
			}
		var services = new Array();
		var counter=0;
		var temp;
		while (temp = servicesRXP.exec(serviceIndex)){
			services[counter] = temp[1];
			counter++;
		}
		return services;
		
	},
	
	getOfflineServices: function(){
		/*Gets the offline services from the database*/
		var offline = mdc.queryDatabase("SELECT * FROM offline", 0);
		dump("Off: "+offline);
		return offline;
	},
	
	saveItem: function(name){
		var enabled = document.getElementById("enabled").checked;
		if(enabled == true){enabled=1;}else{enabled=0;}
		mdc.queryDatabase("UPDATE offline SET enabled='"+enabled+"' WHERE name='"+name+"'",0);
	},
	
	restoreDB: function(){
		/*If the Database in ProfD/services.db does not exist, it will be
		copied from ChromD/services.db. All steps are dumped into the debug
		log. See also restoreDBStructure()*/
		var database = Components.classes["@mozilla.org/file/directory_service;1"].
                     getService(Components.interfaces.nsIProperties).
                     get("ProfD", Components.interfaces.nsIFile);
		database.append("services.db");
		if(database.exists()){
		}
		else{
			dump("\nDatabase is gone.");
			var destination = Components.classes["@mozilla.org/file/directory_service;1"].
						 getService(Components.interfaces.nsIProperties).
						 get("ProfD", Components.interfaces.nsIFile);
			var source = Components.classes["@mozilla.org/file/directory_service;1"].
						 getService(Components.interfaces.nsIProperties).
						 get("AChrom", Components.interfaces.nsIFile);
			source.append("services.db");
			dump("\nTrying to restore...");
			if(!source.exists()){
				alert("\nDatabase Backup not found.");
			}else{
				source.copyTo(destination, "");
				dump("\Done.");
			}
		}
	},
	
	restoreDBStructure: function(){
		/*(UPDATES) If the DB structure is wrong (after updates and stuff), it
		will be regenerated with this lines. Just add lines as shown below. Shouldn't
		be too much magic.*/
		var bookmarks = new Array("id", "name", "url", "played");
		var offline = new Array("name","enabled");
		var history = new Array("artist", "title", "url", "played", "datetime");
		var messages = new Array("id");
				
		var bookmarksCount = mdc.queryDatabase("SELECT COUNT('name') FROM sqlite_master WHERE type='table' AND name='bookmarks'",0);
		var offlineCount = mdc.queryDatabase("SELECT COUNT('name') FROM sqlite_master WHERE type='table' AND name='offline'",0);
		var historyCount = mdc.queryDatabase("SELECT COUNT('name') FROM sqlite_master WHERE type='table' AND name='history'",0);
		var messagesCount = mdc.queryDatabase("SELECT COUNT('name') FROM sqlite_master WHERE type='table' AND name='messages'",0)
		
		if(offlineCount==0){
			mdc.queryDatabase("CREATE TABLE offline(name TEXT, enabled NUMERIC)",0);
		}
		if(bookmarksCount==0){
			mdc.queryDatabase("CREATE TABLE bookmarks(id NUMERIC, name TEXT, url TEXT, played NUMERIC)",0);
		}
		if(historyCount==0){
			mdc.queryDatabase("CREATE TABLE history(artist TEXT, title TEXT, url TEXT, played NUMERIC, datetime TEXT)",0);
		}
		if(messagesCount==0){
			mdc.queryDatabase("CREATE TABLE messages(id NUMERIC)",0);
		}
		var test = mdc.queryDatabase("SELECT sql FROM sqlite_master WHERE tbl_name = 'history' AND type = 'table'",0);
		if(unescape(test).indexOf('name')>0){
			dump("\n\nTable history has format "+test+"\nChanging it to new structure");
			mdc.queryDatabase('CREATE TABLE "history2" ("artist" TEXT, "title" TEXT, "url" TEXT, "played" INTEGER, "datetime" TEXT);',0);
			mdc.queryDatabase('INSERT INTO history2 (artist, title, url, played, datetime) SELECT name, name, url, played, datetime FROM history',0);
			mdc.queryDatabase('DROP TABLE history',0);
			mdc.queryDatabase('ALTER TABLE history2 RENAME TO history',0);
		}
	},
	
	openPrefPane: function(){
		var location = window.location.hash.substring(1);
		document.getElementById('BrowserPreferences').showPane(document.getElementById(location));		
	}
};
