onmessage = function(event){
	var searchterm = event.data;
	var results = getLinks(searchterm);
	postMessage(results);
}
function getLinks(searchterm){
	var results = new Array();
	var req = new XMLHttpRequest();  
	req.open('GET', 'http://vmp3.eu/download/mp3/'+escape(searchterm), false);   
	req.send(null);
	if(req.status == 200){
		var data = req.responseText;
		var pattern = /\(\'(.*?)(?=\',\'download\')/g;
		var re = new RegExp("<h1>Mp3 (.*?) - (.*?) Download<\/h1>(.*?)<a href=\"(.*?)\" rel=");
		var matches = new Array(100);
		while(Ergebnis = pattern.exec(data)){
			var req2 = new XMLHttpRequest();
			req2.open('GET',Ergebnis[1],false);
			req2.send(null);
			if(req2.status == 200){
				try{
				var data2 = req2.responseText;
				track = re.exec(data2);
				var matches = new Array(4);
				matches[0] = track[4];
				matches[1] = track[1];
				matches[2] = track[2];
				matches[3] = "vmp3.eu";
				results.push(matches);
				} catch(e) {}
			}
		}
	}
	return results;
}

//PRO:Many search results for mainstream music%
//CON:Sometimes inaccurate results%