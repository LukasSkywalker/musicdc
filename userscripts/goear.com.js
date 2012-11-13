onmessage = function(event){
	var searchterm = event.data;
	var results = getLinks(searchterm);
	postMessage(results);
}
function getLinks(searchterm){
	var results = new Array();
	var req = new XMLHttpRequest();  
	req.open('GET', 'http://www.goear.com/search/'+escape(searchterm), false);   
	req.send(null);
	if(req.status == 200){
		var data = req.responseText;
		var pattern = /'http:\/\/www\.goear\.com\/listen_popup\.php\?v=(.*?)'/g;
		
		var matches = new Array(100);
		var counter = 0;
		while(Ergebnis = pattern.exec(data)){
			counter++;
			//try{
				var req2 = new XMLHttpRequest();
				var url = 'http://www.goear.com/tracker758.php?f='+Ergebnis[1];
				req2.open('GET', url, false);
				req2.overrideMimeType("text/plain");
				req2.send(null);
				if(req2.status == 200){
					var data2 = req2.responseText;
					var regexp_url = /path="(.*?)"/gi;
					var regexp_artist = /artist="(.*?)"/gi;
					var regexp_title = /title="(.*?)"/gi;
					
					try{url = regexp_url.exec(data2);}catch(e){url = ["",""]}
					try{artist = regexp_artist.exec(data2);}catch(e){artist = ["",""]}
					try{title = regexp_title.exec(data2);}catch(e){title = ["",""]}
					var matches = new Array(4);
					try{matches[0] = url[1];}catch(e){matches[0]="";}
					try{matches[1] = artist[1];}catch(e){matches[1]="";}
					try{matches[2] = title[1];}catch(e){matches[2]="";}
					matches[3] = "goear.com";
					results.push(matches);
				}
			//} catch(e) {}
		}
		//throw new Error(counter);
	}
	return results;
}

//PRO:Many search results for mainstream music%
//CON:Sometimes inaccurate results%