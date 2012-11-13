onmessage = function(event){
	var searchterm = event.data;
	var results = getLinks(searchterm);
	postMessage(results);
}
function getLinks(searchterm){
	var results = new Array();
	var req = new XMLHttpRequest();  
	req.open('GET', 'http://www.emp3world.com/search.php?phrase='+searchterm.replace(/\s/gi, "+")+'&type=mp3s&submit=Search', false);   
	req.send(null);
	if(req.status == 200){
		var data = req.responseText;
		var pattern = /<td width="95\%"><a href="(.*?)">(.*?)<\/a>/g;
		var re = new RegExp('Download Now:<\/b> <a href="(.*?)" rel="nofollow"><u>(.*?) - (.*?)<\/u><\/a>');
		var matches = new Array(100);
		while(Ergebnis = pattern.exec(data)){
			var req2 = new XMLHttpRequest();
			req2.open('GET','http://www.emp3world.com'+Ergebnis[1], false);
			req2.send(null);
			if(req2.status == 200){
				try{
					var data2 = req2.responseText;
					track = re.exec(data2);
					var matches = new Array(4);
					matches[0] = 'http://www.emp3world.com'+track[1];
					matches[1] = track[2];
					matches[2] = track[3];
					matches[3] = "emp3world.com";
					results.push(matches);
				} catch(e) {}
			}
		}
	}
	return results;
}

//PRO:Many search results for mainstream music%
//CON:Sometimes inaccurate results%