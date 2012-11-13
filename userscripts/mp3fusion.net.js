onmessage = function(event){
	var searchterm = event.data;
	var results = getLinks(searchterm);
	postMessage(results);
}
function getLinks(searchterm){
	var results = new Array();
	var req = new XMLHttpRequest();  
	req.open('GET', 'http://www.mp3fusion.net/s/'+searchterm.replace(/\s/gi, "-")+'-1.html', false);   
	req.send(null);
	if(req.status == 200){
		var data = req.responseText;
		var pattern = /javascript:Listen\(\'\/listen.php\?(.*?)\'/g;
		var file = /file=(.*?)&/gi;
		var name = /<title>(.*?) (.*?) \| Mp3Fusion.net - Free Mp3 Downloads & Songs<\/title>/gi;
		var matches = new Array(100);
		while(Ergebnis = pattern.exec(data)){
			var req2 = new XMLHttpRequest();
			req2.open('GET','http://www.mp3fusion.net/listen.php?'+Ergebnis[1], false);
			req2.send(null);
			if(req2.status == 200){
				try{
					var data2 = req2.responseText;
					track = file.exec(data2);
					bla = name.exec(data2);
					var matches = new Array(4);
					matches[0] = track[1];
					matches[1] = bla[1];
					matches[2] = bla[2];
					matches[3] = "mp3fusion.net";
					results.push(matches);
				} catch(e) {}
			}
		}
	}
	return results;
}

//PRO:Many search results for mainstream music%
//CON:Sometimes inaccurate results%