var playlist = {
	playlistFileUrl : '',
	playlistnsifile: '',
	playlistFile: '',

	addToPlaylist: function(data, position){
		var temp1 = mdc.playlist.slice(0, position);
		var temp2 = mdc.playlist.slice(position);
		mdc.playlist = temp1;
		mdc.playlist.push(data);
		for(var i=0; i<temp2.length; ++i){
			mdc.playlist.push(temp2[i]);
		}
		if(mdc.currentPosition > position){
			mdc.currentPosition=mdc.currentPosition+1;
		}
		this.updatePlaylist();
	},
	
	removeFromPlaylist: function( position ){
		mdc.playlist.splice(position,1);
		if(position < mdc.currentPosition ){
			mdc.currentPosition = mdc.currentPosition - 1;
		}
		this.updatePlaylist();
	},
	
	updatePlaylist: function(){
		var listBox = document.getElementById("playlist-tree");
		while(listBox.getRowCount() != 0) {
			listBox.removeItemAt(0);
    }
		for(var i=0; i<mdc.playlist.length; ++i){
			var item = document.createElement("listitem");
			var url = mdc.playlist[i][0];
			var artist = unescape(unescape(mdc.playlist[i][1]));
			var title = unescape(unescape(mdc.playlist[i][2]));
			item.setAttribute("label", unescape(unescape(title)));
			item.setAttribute("tooltiptext", unescape(artist)+" - "+unescape(title));
			item.setAttribute("ondblclick", "mdc.currentPosition = "+i+"; flash.setPlaying(); mdc.play('"+escape(artist)+"', '"+escape(title)+"', '"+escape(url)+"', null, null); ");
			item.setAttribute("ondragover", "return false");
			item.setAttribute("class", "playlistitem");
			item.setAttribute("id", "playlistitem_"+i);
			item.setAttribute("ondrop", "playlist.insertAction(event.dataTransfer.getData('text/plain'), this); event.stopPropagation();");
			listBox.appendChild(item);
		}
		
		var player = document.getElementById("player");
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
	},
	
	insertAction: function(url, element ){
		if(element == document.getElementById('playlist-tree')){
			var position = mdc.playlist.length;
		}
		if(element.getAttribute("class")=='playlistitem'){
			var position = element.getAttribute("id").replace("playlistitem_","")
		}
		var newArray = Array(3);
		newArray[0] = url.split("%2S")[0];
		newArray[1] = url.split("%2S")[1];
		newArray[2] = url.split("%2S")[2];
		playlist.addToPlaylist(newArray, position);
	},
	
	loadLocalPlaylist: function(){
		var file = mdc.filePicker("open", '', '' , '', '*.m3u; *.pls; *.xspf');
		this.playlistFile = file;
		var ios = Components.classes["@mozilla.org/network/io-service;1"].
				  getService(Components.interfaces.nsIIOService);
		var URL = ios.newFileURI(file).spec;
		this.playlistFileUrl = URL;
		var req = new XMLHttpRequest();
		req.open('GET', URL, false); 
		req.send(null);
		if(req.status == 0){
			var xml = (new DOMParser()).parseFromString(req.responseText, "text/xml");
			var namespace = xml.firstChild.getAttribute("xmlns");
			if(req.responseText.match(/#EXTM3U/gi)){
				
				//MORE INFORMATION ABOUT THE M3U NON-STANDARD BELOW				

				var pattern = /^(?!\#EXT)(.*?[\.mp3|\.ogg|\.mp3])$/mgi;
				var pattern2 = /^#EXTINF:[0-9]+,(.*?)$/mgi;
				var lines = new Array();
				var names = new Array();
				var urls = new Array();
				/*for(var i=0; i<lines.length;i++){
					if(lines[i]=="" || lines[i]== undefined || lines[i].match(/^#EXTVLCOPT(.*?)$/mig) || lines[i].match(/^#EXTM3U$/mig)){
						lines.splice(i,1);		//remove empty lines
					}
				}*/
				while(ergebnis = pattern.exec(req.responseText)){
					urls.push(ergebnis[1]);
				}
				while(ergebnis2 = pattern2.exec(req.responseText)){
					names.push(escape(ergebnis2[1]));
				}
				//lines.splice(0,1);	//remove #EXTM3U line at begin of the file
				/*for(var i=1;i<lines.length;i=i+2)
				{	
					urls.push(lines[i]);
				}*/
				for(var j=0; j<names.length;j++){
					//var url = urls[j];
					//var name = names[j];
					var data = this.getTags(names[j], urls[j] );
					data[1] = escape(data[1]);
					data[2] = escape(data[2]);
					playlist.addToPlaylist(data, mdc.playlist.length);
				}
			
			}else if(req.responseText.match(/\[playlist\]/gi)){

				//MORE INFORMATION ABOUT THE PLS NON-STANDARD BELOW				

				var pattern_file = /^File[0-9]+=(.*?)$/mgi;
				var pattern_title = /^Title[0-9]+=(.*?)$/mgi;
				var pattern_length = /^Length[0-9]+=(.*?)$/mgi;
				
				while(url = pattern_file.exec(req.responseText)){
					var name = pattern_title.exec(req.responseText);
					var length = pattern_length.exec(req.responseText);
					var name = name[1];
					var url = url[1];
					
					var data = this.getTags(name, url );
					data[1] = escape(data[1]);
					data[2] = escape(data[2]);
					playlist.addToPlaylist(data, mdc.playlist.length);
					
				}
			}else if(namespace == 'http://xspf.org/ns/0/'){

				//MORE INFORMATION ABOUT THE XSPF STANDARD BELOW				

				var xml = (new DOMParser()).parseFromString(req.responseText, "text/xml");
				var trackList = xml.getElementsByTagName("trackList")[0];
				var tracks = trackList.getElementsByTagName("track");
				for(var i=0; i<tracks.length; ++i){
					var url = tracks[i].getElementsByTagName("location")[0].firstChild.nodeValue;
					if(tracks[i].getElementsByTagName("title")[0]){
						var name = tracks[i].getElementsByTagName("title")[0].firstChild.nodeValue;
					}else{
						var name = mdc.getLast(url, "/");
					}
					var data = this.getTags(name, url );
					data[1] = escape(data[1]);
					data[2] = escape(data[2]);
					playlist.addToPlaylist(data, mdc.playlist.length);					
				}
			}else{
				alert("Unknown format.")
			}
		}
	},
	
	savePlaylist: function(){
		var ios = Components.classes["@mozilla.org/network/io-service;1"].
          getService(Components.interfaces.nsIIOService);
		var file = mdc.filePicker('save', null, 'Playlist', 'm3u', '*.m3u');
		// file is nsIFile, data is a string
		var data = "#EXTM3U\n";
		for(var i=0; i<mdc.playlist.length;++i){
			data+="#EXTINF:0,"+mdc.playlist[i][1]+" - "+mdc.playlist[i][2]+"\n";
			data+=mdc.playlist[i][0].replace("%3A", ":")+"\n";
		}
		
		var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].
					   createInstance(Components.interfaces.nsIFileOutputStream);

		// use 0x02 | 0x10 to open file for appending.
		foStream.init(file, 0x02 | 0x08 | 0x20, 0666, 0); 
		// write, create, truncate
		// In a c file operation, we have no need to set file mode with or operation,
		// directly using "r" or "w" usually.

		// if you are sure there will never ever be any non-ascii text in data you can 
		// also call foStream.writeData directly
		var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].
						createInstance(Components.interfaces.nsIConverterOutputStream);
		converter.init(foStream, "UTF-8", 0, 0);
		converter.writeString(data);
		converter.close(); // this closes foStream
		mdc.showMessageBox('99FF33','',mdc.playlistWasSaved, true, '','');
	},
	
	getTags: function(name, url){
		var os = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS;
		if(url.match("/")){
			var url_leafName = mdc.getLast(url, "/");
		}else if(url.match(/\\/gi)){
			var url_leafName = mdc.getLast(url, /\\/gi);
		}
		if(url.indexOf("file")!=0 && url.indexOf("http")!=0){
			if(url.indexOf("/")==0 || url.indexOf(/\\/gi)==0){	//local FS relative, with preceding / or \
				url = (this.playlistFileUrl.replace(escape(this.playlistFile.leafName),"")+url.substr(1));
			}else{					//local FS, absolute or relative without / or \	C:\musik.mp3 or music.mp3
				try{			//absolute
					var aFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
					if(os=="WINNT"){
						aFile.initWithPath(url.replace(/\//gi, "\\"));
					}else{
						aFile.initWithPath(url.replace(/\\\\/gi, "/"));
					}
					
				}catch(e){		//relative
					if(this.playlistFile.path.match("\\\\")){		//We are on win, escaped backslashes, unescape them
						var baseDir = this.playlistFile.path.replace(/\\\\/gi,"\\");
					}else{
						var baseDir = this.playlistFile.path;	//win, they are unescaped...
					}
					var aFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
					if(os=="WINNT"){
						aFile.initWithPath((baseDir.replace(this.playlistFile.leafName,"")+url).replace(/\\\\/gi,"\\").replace(/\//gi,"\\"));
					}else{
						aFile.initWithPath((baseDir.replace(this.playlistFile.leafName,"")+url).replace(/\\\\/gi,"/").replace(/\\/gi,"/"));
					}
				}
				var ios = Components.classes["@mozilla.org/network/io-service;1"].
						  getService(Components.interfaces.nsIIOService);
				var url = ios.newFileURI(aFile).spec;
			}
		}else{
			//absolute file:/// or http:// url; nothing to do here.
		}
		if(name.indexOf("-")>4){			//assume that artist - title separator comes earliest after 3 chars...
			var title = mdc.getLast(name,"-").replace(".mp3","").replace(".ogg", "").trim();
			var artist = name.replace("-"+mdc.getLast(name,"-"), "").replace(".mp3","").replace(".ogg","").trim();
		}else if(url_leafName.indexOf("-")>4){
			var title = mdc.getLast(url_leafName,"-").replace(".mp3","").replace(".ogg", "").trim();
			var artist = url_leafName.replace("-"+mdc.getLast(url_leafName,"-"), "").replace(".mp3","").replace(".ogg","").trim();
		}else{
			var artist = '';
			var title = name.replace(".mp3","").replace(".ogg","").trim();
		}
		return (new Array(url, artist.trim(), title.trim()));
	},
};


/*###########################			XSPF		##################################################

				<?xml version="1.0" encoding="UTF-8"?>
				<playlist version="1" xmlns="http://xspf.org/ns/0/">
					<trackList>
						<track>
							<title>#EXTINF:0,Andrea Bocelli - Laura Pausini - Vivo Per Lei.mp3</title>
							<location>..\Andrea Bocelli - Laura Pausini\Unbekannt\Andrea Bocelli - Laura Pausini - Vivo Per Lei.mp3</location>
						</track>
						<track>
							<title>#EXTINF:0,Jennifer Lopez Feat. Pitbull - On The Floor.mp3</title>
							<location>..\Jennifer Lopez Feat. Pitbull - On The Floor.mp3</location>
						</track>
					</trackList>
				</playlist>

/*###########################			M3U		##################################################

				#EXTM3U
				#EXTINF:123,Sample Artist - Sample title
				Sample.mp3
				#EXTINF:321,Example Artist - Example title
				Greatest Hits\Example.ogg
				
				
/*###########################			PLS		##################################################

				[playlist]
				File1=http://streamexample.com:80
				Title1=My Favorite Online Radio
				Length1=-1
				File2=http://example.com/song.mp3
				Title2=Remote MP3
				Length2=286
				//OPTONAL!!
				NumberOfEntries=3
				Version=2
				
/*################################################################################################*/