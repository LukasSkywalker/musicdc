onmessage = function(event){
	var searchterm = event.data;
	var results = getLinks(searchterm);
	postMessage(results);
}
function getLinks(searchterm){
	var results = new Array();
	var req = new XMLHttpRequest();  
	req.open('GET', 'http://prostopleer.com/search?q='+escape(searchterm), false);   
	req.send(null);
	if(req.status == 200){
		var data = req.responseText;
		var pattern = /singer="(.*?)" song="(.*?)" link="(.*?)"/g;
		var matches = new Array(100);
		while(Ergebnis = pattern.exec(data)){
			var req2 = new XMLHttpRequest();
			var artist = Ergebnis[1];
			var title = Ergebnis[2];
			var id = Ergebnis[3];
			var url = "http://prostopleer.com/site_api/files/get_url";
			var params = "action=download&id="+id;
			req2.open('POST',url,false);
			req2.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			req2.setRequestHeader("Accept", "application/json, text/javascript, */*");
			req2.setRequestHeader("X-Requested-With", "XMLHttpRequest");
			req2.send(params);
			if(req2.status == 200){
				var data2 = req2.responseText;
				var jsonData = JSON.parse(data2);
				var url2 = jsonData.track_link;
				var matches = new Array(4);
				matches[0] = url2;
				matches[1] = artist;
				matches[2] = title;
				matches[3] = "prostopleer.com";
				results.push(matches);
			}
		}
	}
	return results;
}

//PRO:Many search results for mainstream music%
//CON:Sometimes inaccurate results%