/* This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Creative Commons
 * Attribution-NonCommercial-ShareAlike Version 3.0, as published
 * by Creative Commons. See 
 * http://creativecommons.org/licenses/by-nc-sa/3.0/legalcode for
 * more details. */ 
 
 /**
  * The main object of the radio window. Used for all radio-only actions
  */
 var radio={
	genres: '',
	/**
	 * Gets the genre list from the shoutcast server. Used for displaying the genre picker
	 * @return a string array of the genres
	 */
	getGenreList: function(){
		var genrelist = mdc.getFile('http://dir.xiph.org/yp.xml');
		if(!genrelist){
			return;
		}
		var xml = (new DOMParser()).
				parseFromString(genrelist, "text/xml");
		var genreList = xml.getElementsByTagName("directory")[0].
				getElementsByTagName("entry");
		this.genres = new Array();
		this.genres.push(genreList[0].firstChild.nodeValue);
		for(var i=0; i<genreList.length; i++){
			var temp = genreList[i].getElementsByTagName('genre')[0].firstChild.nodeValue.split(" ");
				for(var k=0; k<temp.length; k++){
					this.genres.push(temp[k]);
				}
		}
		this.genres.sort();
		
		for(var i=0; i<this.genres.length; ++i){
			if(this.genres[i+1]==this.genres[i]){
				this.genres.splice(i,1);
				i--;
			}
		}
		return(this.genres);
	},

	/**
	 * Fetches the station list for a specific URL (mostly the 
	 * ShoutCast Server + Genre or the ShoutCast Server + searchterm)
	 * @return array an array of the available stations
	 * @param url the url of the station list to get
	 */
	/*getStationList : function( url ) {
		var genrelist = mdc.getFile('http://dir.xiph.org/yp.xml');
		var xml = (new DOMParser()).
				parseFromString(genrelist, "text/xml");
		var genreList = xml.getElementsByTagName("directory")[0].
				getElementsByTagName("entry");
				
		var responseText = mdc.getFile(url);
		var xml = (new DOMParser()).
				parseFromString(responseText, "text/xml");
		var stationList = xml.getElementsByTagName("stationlist")[0].
				getElementsByTagName("station");
		return (stationList);
	},*/
	
	/**
	 * Creates the list box (Genre picker) in the Radio tab.
	 * @returns nothing
	 */
	createListBox: function(){
		var listbox = document.getElementById("radio_genremenupopup");
		if(listbox.firstChild.getAttribute("id") == "radio_spacer"){
			listbox.removeChild(listbox.firstChild);
			mdc.showThrobber("radio", true);
			mdc.clearTree('radio_genremenupopup');
			var genreList = this.getGenreList();
			if(genreList){
				for (var i=0; i<genreList.length; i++) {
					var genre = genreList[i];
					//var name = genre.getAttribute("name");
					var Item = document.createElement("menuitem");
						Item.setAttribute("value",genre);
						Item.setAttribute("label",genre.charAt(0).toUpperCase() + genre.slice(1));
					listbox.appendChild(Item);
				}
			}
			mdc.showThrobber("radio", false);
		}
	},
	
	/** plays a ShoutCast stream. Notice the  url+="/;". It's used
	 * because the shoutCast servers send a HTTP response if the user agent
	 * is not WinAmp (?). the URL suffix fixes this :-)
	 * @param tree the ID of the tree to play the selected Element from
	 */
	playShoutCast: function( tree ){
		var tree = document.getElementById( tree );
		var cellIndex = 2;
		var url = tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(cellIndex));
		var cellIndex = 1;
		var title = tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(cellIndex));
		//url+="/;";
		//ShoutCast hack
		mdc.play( title, '', url, "radio", url );
	},
	
	/**Lists all stations of the genre given
	 * @param genre the genre to list
	 */
	listStationOfGenre: function( genre ){
		var stations = new Array();
		mdc.showThrobber("radio",true);
		mdc.clearTree("radio_treechildren");
		var stationList = mdc.getFile('http://dir.xiph.org/yp.xml');
		var pattern = new RegExp(genre, "ig");
		var xml = (new DOMParser()).
				parseFromString(stationList, "text/xml");
		var stationList = xml.getElementsByTagName("directory")[0].
				getElementsByTagName("entry");
		if(genre.charCodeAt(0) == 10){
			for(var i=0; i<stationList.length; ++i){
				stations.push(stationList[i]);
			}
		}
		else{
			for(var i=0; i<stationList.length; ++i){
			if(this.getGenreFrom(stationList[i]).match(pattern)){
				stations.push(stationList[i]);
			}
		}
		this.writeTree(stations);
		mdc.showThrobber("radio",false);	
		}
		
		
		
	},
	
	getIdFromSelection: function( tree ){
		var tree = document.getElementById( tree );
		var start = {};
		var end = {};
		tree.view.selection.getRangeAt(0, start, end);//download all selected items
		var c = start.value;
		var id = tree.view.getItemAtIndex(c).getAttribute("id");
		return id;
	},
	
	/**
	 * Reads a PLS file (displays only the first entry!!!)
	 * @param url an URL where the pls file is located
	 * @return blergh the url of the music file or stream at position 1
	 */
	readPlsFile: function( url ){
		var pls = mdc.getFile( url );
		var pattern = /File1=(.*)/g;
		while (Ergebnis = pattern.exec(pls)){
			var blergh = Ergebnis[1];
		}
		return blergh;
	},
	
	fullSearch: function(searchterm){
		var stations = new Array();
		var pattern = new RegExp(searchterm, 'ig');
		/*Makes a full Search through all genres on the ShoutCast server*/
		mdc.showThrobber( "search", true);
		//document.getElementById('search-stop').disabled = false;
		mdc.clearTree("radio_treechildren");
		var list = mdc.getFile('http://dir.xiph.org/yp.xml');
		var xml = (new DOMParser()).
				parseFromString(list, "text/xml");
		var stationList = xml.getElementsByTagName("directory")[0].
				getElementsByTagName("entry");
		for(var i=0; i<stationList.length; ++i){
			//alert(this.getNameFrom(stationList[i]));
			if(this.getTrackFrom(stationList[i]).match(pattern)){
				stations.push(stationList[i]);
				this.writeTree(stationList[i]);
			}
			if(this.getNameFrom(stationList[i]).match(pattern)){
				stations.push(stationList[i]);
			}
		}
		alert(stations);
		this.writeTree(stations);
		mdc.searchComplete();
	},
	
	writeTree: function(stationList){
		for (var i=0; i<stationList.length; i++) {
			var currentTrack = 'unknown';
			var station = stationList[i];
			var name = this.getNameFrom(station);
			var url = this.getUrlFrom(station);
			var bitrate = this.getBitrateFrom(station);
			if(station.getElementsByTagName("current_song")[0].firstChild){
				currentTrack = this.getTrackFrom(station);
			}
			
			
			var tree = document.getElementById('radio_treechildren');
			var oItem = document.createElement("treeitem");

			var oRow = document.createElement("treerow");
			oItem.setAttribute("id", url+"%S"+currentTrack);
			
			var oCell = document.createElement("treecell");
			var starred = mdc.queryDatabase("SELECT COUNT(*) FROM 'bookmarks' WHERE id='"+url+"'",0);
			
			if(starred == "0"){
				oCell.setAttribute('value', 'false');
			}
			if(starred>0){
				oCell.setAttribute('value', 'true');
			}
			oRow.appendChild(oCell);
			
			var oCell = document.createElement("treecell");
			oCell.setAttribute('label', name);
			oCell.setAttribute('editable', 'false');
			oRow.appendChild(oCell);
					
			var oCell = document.createElement("treecell");		//hidden
			oCell.setAttribute('label', url);
			oCell.setAttribute('editable', 'false');
			oRow.appendChild(oCell);
		
			var oCell = document.createElement("treecell");
			oCell.setAttribute('label', '#');
			oCell.setAttribute('editable', 'false');
			oRow.appendChild(oCell);
				
			oItem.appendChild(oRow);
			tree.appendChild(oItem);
		}
	},
	
	getHeader: function( url, name ){
		dump('\nGetting '+name+' from '+url);
		var req = new XMLHttpRequest(); 
 	    req.open('GET', url, false); 
 	    req.send(null); 
 	    if(req.status == 200){ 
 	        var mimetype = req.getResponseHeader( name ); 
 	    }
		return mimetype;
	},
	
	updateBookmarks: function(event){
		/*
		############################
		#####   DANGER: BUGGY  #####
		############################
		Fix this as soon as possible
		*/
		var row = {}, column = {}, part = {};
		var tree = document.getElementById("radio_maintree");

		var boxobject = tree.boxObject;
		boxobject.QueryInterface(Components.interfaces.nsITreeBoxObject);
		boxobject.getCellAt(event.clientX, event.clientY, row, column, part);
		boxobject.getCellAt(event.clientX, event.clientY, row, column, part);
		
		if (column.value && typeof column.value != "string" && column.value.id=="stars"){
			var name = tree.view.getCellText(row.value, tree.columns.getColumnAt(1));
			var listeners = tree.view.getCellText(row.value, tree.columns.getColumnAt(3));
			var id = tree.view.getCellText(row.value, tree.columns.getColumnAt(2));	
			var url = id;
			var alreadyStarred = mdc.queryDatabase("SELECT COUNT(*) FROM 'bookmarks' WHERE id='"+id+"'", 0);
			if(alreadyStarred > 0){
				mdc.queryDatabase("DELETE FROM 'bookmarks' WHERE id='"+id+"'",0);
			}
			else{
				mdc.queryDatabase("INSERT INTO 'bookmarks' ('id', 'name', 'url', 'played') VALUES ('"+id+"','"+name.replace(/\'/gi,"''")+"','"+url+"','1')",0);
			}
		}
		document.getElementById("bookmarks_children").builder.rebuild();
		//document.getElementById("menu_bookmarks_children").builder.rebuild();	--> not used anymore since bookmarks in menu are removed
	},
	
	getGenreFrom: function( station ){
		return station.getElementsByTagName("genre")[0].firstChild.nodeValue;
	},
	
	getNameFrom: function( station ){
		return station.getElementsByTagName("server_name")[0].firstChild.nodeValue;
	},
	
	getTrackFrom: function( station ){
		return station.getElementsByTagName("current_song")[0].firstChild.nodeValue;
	},
	
	getUrlFrom: function( station ){
		return station.getElementsByTagName("listen_url")[0].firstChild.nodeValue;
	},
	
	getBitrateFrom: function( station ){
		return station.getElementsByTagName("bitrate")[0].firstChild.nodeValue;
	},
	
	
	/*getCurrentTrack: function(element){
		switch(mdc.currentType){
			case  "shoutcast":
				var stationName = element.value;
				var stationList = this.getStationList("http://yp.shoutcast.com/sbin/newxml.phtml?search="+stationName);
				for (var i=0; i<stationList.length;++i){
					var station = stationList[0];
					var currentTrack = station.getAttribute("ct");
					var id = station.getAttribute("id");
					if(id == mdc.currentId){
						mdc.selectSearchEngine('search');
						mdc.globalSearch(currentTrack);
						break;
					}
				}
				break;
			/*case "search":
				document.getElementById('searchbar-textbox').value = element.value;
				document.getElementById('tabsid').selectedIndex = '0';
				search.searchCommand()
				break;
		}
	},*/
	
	removeFromBookmarks : function ( tree ) {
		var url = tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(2));
		mdc.queryDatabase("DELETE FROM bookmarks WHERE url='"+url+"'");
		document.getElementById("bookmarks_children").builder.rebuild();
	}
};