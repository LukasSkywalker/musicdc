var flash={
	onId3Loaded: function( dataArray ){
		var album = dataArray[0];
		var artist = dataArray[1];
		var title = dataArray[2];
		if(artist == null || title== null || artist == "" || title == ""){ return; }
		document.getElementById("faceplate").value = artist + " - " +title;
		document.title = "Music Download Center | "+artist +" - "+title;
		mdc.newArtist = artist;
		mdc.newTitle = title;
		flash.getCoverArt(dataArray);
		window.clearTimeout(mdc.coverTimer);
		//this.getLyrics(artist, title);
	},
	
	getCoverArt: function(data){
		if(!data){
			var data = new Array(2);
			data[1] = mdc.newArtist;
			data[2] = mdc.newTitle;
		}
		document.getElementById('coverart-image').setAttribute('src', 'chrome://mdc/skin/icons/vinyl.png');
		
		//mdc.showThrobber('cover', true);
		var artist = data[1];
		var title = data[2].replace(/\.mp3/gi,"");
		var limit = 1;
		if(this.artist == artist && this.title == title){
			return;
		}
		this.artist = artist;
		this.title = title;
		var req = new XMLHttpRequest();
		req.open('GET', 'http://ws.audioscrobbler.com/2.0/?method=track.getinfo&api_key=207b43760076e1463911df273e7ba923&artist='+escape(artist)+'&track='+escape(title), true);
		req.onreadystatechange = function (aEvt) {
		  if (req.readyState == 4) {
			 if(req.status == 200){
				var pattern = /<image size="large">(.*?)<\/image>/gi;
					try{
						var Ergebnis = pattern.exec(req.responseText);
						var coverartImage = document.getElementById('coverart-image');
						//if(Ergebnis[1]!='http://cdn.last.fm/flatness/catalogue/noimage/2/default_album_medium.png'){
							coverartImage.setAttribute('src', Ergebnis[1]);
							coverartImage.setAttribute('index', limit);
							coverartImage.setAttribute('onclick', "mdc.openInternalBrowser("+Ergebnis[1]+", 200,200)");
						//}
					}catch(e){
						dump('\nRegex 1 failed.');
					}
				
			  }
			 else{
			  dump("Error loading page\n");
				//flash.getAmazonCover(artist, title);
			 }
		  }
		};
		req.send(null);
	},
	
	setData: function(aArray){
		mdc.currentName = aArray[1]+" - "+aArray[2];
		mdc.currentURL = aArray[0];
	},
	
	onPlaybackFinished: function(){
		if(mdc.currentType == 'radio'){
			return;
		}
		if(mdc.currentPosition<mdc.playlist.length-1){
			document.getElementById('playlist-tree').getItemAtIndex(mdc.currentPosition).removeAttribute('playing');
			mdc.currentPosition=mdc.currentPosition+1;
			var artist = mdc.playlist[mdc.currentPosition][1];
			var title = mdc.playlist[mdc.currentPosition][2];
			var url = mdc.playlist[mdc.currentPosition][0];
			mdc.play(artist, title, unescape(url), 'prev', null);
			this.setPlaying();
		}
	},
	
	getLyrics: function( artist, title ){
		var req = new XMLHttpRequest();
		req.open('GET', "http://api.chartlyrics.com/apiv1.asmx/SearchLyricDirect?artist="+escape(artist)+"&song="+escape(title), true);
		req.onreadystatechange = function (aEvt) {
		  if (req.readyState == 4) {
			 if(req.status == 200){
			  var xml = (new DOMParser()).parseFromString(req.responseText, "text/xml");
				var lyricResult = xml.getElementsByTagName("GetLyricResult")[0];
				var lyricId = lyricResult.getElementsByTagName("LyricId")[0].firstChild.nodeValue;
				if(lyricId != 0){
					var lyrics = lyricResult.getElementsByTagName("Lyric")[0].firstChild.nodeValue;
					if(lyrics){
						//alert(lyrics);
						document.getElementById('popup_lyrics').showPopup( document.getElementById('coverart-panel'), -1, -1, 'popup', 'bottomright', 'bottomleft' );
						document.getElementById('popup_lyrics').sizeTo(300,300)
						document.getElementById('popup_lyrics_label').setAttribute('value',lyrics);
					}
				}else{	
					var req2 = new XMLHttpRequest();
					req2.open('GET', "http://lyrics.wikia.com/api.php?artist="+artist+"&song="+title+"&fmt=xml", true);
					req2.onreadystatechange = function (aEvt) {
					  if (req2.readyState == 4) {
						 if(req2.status == 200){
							var xml = (new DOMParser()).parseFromString(req2.responseText, "text/xml");
							var lyricResult = xml.getElementsByTagName("LyricsResult")[0];
							mdc.openInternalBrowser(lyricResult.getElementsByTagName("url")[0].firstChild.nodeValue, 800, 600);
						 }else{
							dump("Error loading page\n");
						  }
					  }
					};
					req2.send(null);
				}
			 }else{
				dump("Error loading page\n");
			  }
		  }
		};
		req.send(null);
		
		
		/*var responseText = mdc.getFile("http://api.chartlyrics.com/apiv1.asmx/SearchLyricDirect?artist="+escape(artist)+"&song="+escape(title));
		var xml = (new DOMParser()).parseFromString(responseText, "text/xml");
		var lyricResult = xml.getElementsByTagName("GetLyricResult")[0];
		var lyricId = lyricResult.getElementsByTagName("LyricId")[0].firstChild.nodeValue;
		if(lyricId != 0){
			var lyrics = lyricResult.getElementsByTagName("Lyric")[0].firstChild.nodeValue;
			if(lyrics){
				//alert(lyrics);
				document.getElementById('popup_lyrics').showPopup( document.getElementById('coverart-panel'), -1, -1, 'popup', 'bottomright', 'bottomleft' );
				document.getElementById('popup_lyrics').sizeTo(300,300)
				document.getElementById('popup_lyrics_label').setAttribute('value',lyrics);
			}
		}else{		
			var responseText = mdc.getFile("http://lyrics.wikia.com/api.php?artist="+artist+"&song="+title+"&fmt=xml");
			var xml = (new DOMParser()).parseFromString(responseText, "text/xml");
			var lyricResult = xml.getElementsByTagName("LyricsResult")[0];
			mdc.openInternalBrowser(lyricResult.getElementsByTagName("url")[0].firstChild.nodeValue, 800, 600);
		}*/
	},
	
	onClickNext: function(){
		this.onPlaybackFinished();
	},
	
	onClickPrevious: function(){
		if(mdc.currentPosition > 0){
			mdc.currentPosition = mdc.currentPosition - 1;
			var artist = mdc.playlist[mdc.currentPosition][1];
			var title = mdc.playlist[mdc.currentPosition][2];
			var url = mdc.playlist[mdc.currentPosition][0];
			mdc.play(artist, title, unescape(url), 'prev', null);
			this.setPlaying();
		}
	},
	
	setPlaying: function(){
		var playlist = document.getElementById('playlist-tree');
		var children = playlist.childNodes;
		for(var i=0; i<children.length;++i){
			children[i].setAttribute('playing', 'false');
		}
		playlist.getItemAtIndex(mdc.currentPosition).setAttribute('playing','true');
		playlist.selectedIndex = mdc.currentPosition;
	},
	
	getAmazonCover: function(artist, title){
		var req2 = new XMLHttpRequest();
			req2.open('GET', 'http://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Dpopular&field-keywords='+artist.replace(/\s/gi,"+")+'+'+title.replace(/\s/gi, "+")+'&x=0&y=0', true);
			alert('Get: http://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Dpopular&field-keywords='+artist.replace(/\s/gi,"+")+'+'+title.replace(/\s/gi, "+")+'&x=0&y=0');
			req2.onreadystatechange = function (aEvt) {
				if (req2.readyState == 4) {
					if(req2.status == 200){
						var pattern = /<img src="(.*?)" class="productImage" alt="Product Details">/gi;
						try{
							var result = pattern.exec(req.responseText);
							alert(result[1]);
						}catch(e){
							dump('\nRegex failed. Trying second...');
							var pattern2 = /src="(.*?)" class="" alt="Product Details"/gi;
							try{
								var result2 = pattern2.exec(req2.responseText);
								alert(result2[1]);
							}catch(e){
								dump('\nRegex failed. Aborting.')
							}
						}
						
					}
					else{
						dump("Error loading page\n");
					}
				}
			};
		req2.send(null);
	},
};