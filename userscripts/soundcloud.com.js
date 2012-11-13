onmessage = function(event){
	var searchterm = event.data;
	var results = getLinks(searchterm);
	postMessage(results);
}
function getLinks(searchterm){
	var results = new Array();
	var req = new XMLHttpRequest();  
	req.open('GET', 'http://api.soundcloud.com/tracks?q='+escape(searchterm)+'&consumer_key=tQujYcrWxzKji0ep3m0Acw', false);   
	req.send(null);
	if(req.status == 200){
		var data = req.responseText;
		var downloadable = /<downloadable type="boolean">(.*?)<\/downloadable>/gi;
		var title = /<title>(.*?)<\/title>/gi;
		var user = /<username>(.*?)<\/username>/gi;
		var downloadUrl = /<download-url>(.*?)<\/download-url>/gi;
		while(Ergebnis = downloadable.exec(data)){
			if(Ergebnis[1] == 'true'){
				try{
				matchTitle = title.exec( data );
				matchUser = user.exec( data );
				matchDownloadUrl = downloadUrl.exec( data );			
				matches = new Array(4);
				if(matchDownloadUrl){matches[0] = matchDownloadUrl[1]+'?consumer_key=tQujYcrWxzKji0ep3m0Acw';}else{matches[0] = ''};
				if(matchUser) {matches[1] = matchUser[1];}else{matches[1] = ''};
				if(matchTitle) {matches[2] = matchTitle[1];}else{matches[2] = ''};
				matches[3] = 'soundcloud.com';
				results.push(matches);
				}
				catch(e){}
			}else{
				var bla = title.exec( data );
				bla = user.exec( data );
				bla = downloadUrl.exec( data );
			}
			
		}
		
	}
	return results;
}
//PRO:Crazy remixes for every song%
//CON:No originals%