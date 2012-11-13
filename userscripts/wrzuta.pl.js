onmessage = function(event){
	var searchterm = event.data;
	var results = getLinks(searchterm);
	postMessage(results);
}
function getLinks(searchterm){
	var results = new Array();
	var req = new XMLHttpRequest();  
	req.open('GET', 'http://www.wrzuta.pl/szukaj/audio/'+searchterm.replace(/\s/gi, "+")+'/', false);   
	req.send(null);
	if(req.status == 200){
		var data = req.responseText;
		var pattern = /<a href="http:\/\/(.*?).wrzuta.pl\/audio\/(.*?)\/(.*?)" class="thumb_url">/g;
		var url = /<fileId><\!\[CDATA\[(.*?)\]\]><\/fileId>/gi;
		var name = /<name><\!\[CDATA\[(.*?) - (.*?)\]\]><\/name>/gi;
		var matches = new Array(100);
		while(Ergebnis = pattern.exec(data)){
			var req2 = new XMLHttpRequest();
			req2.open('GET', 'http://'+Ergebnis[1]+'.wrzuta.pl/xml/plik/'+Ergebnis[2]+'/wrzuta.pl/undefined/1',false);
			req2.send(null);
			if(req2.status == 200){
				try{
					var data2 = req2.responseText;
					var ad = url.exec(data2)
					track = name.exec(data2);
					var matches = new Array(4);
					matches[0] = ad[1];
					matches[1] = track[1];
					matches[2] = track[2];
					matches[3] = "wrzuta.pl";
					results.push(matches);
				} catch(e) {}
			}
		}
	}
	return results;
}

//PRO:Many search results for mainstream music%
//CON:Sometimes inaccurate results%