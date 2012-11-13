onmessage = function(event){
	var searchterm = event.data;
	var results = getLinks(searchterm);
	postMessage(results);
}
function getLinks(searchterm){
	var req = new XMLHttpRequest();
	var results = new Array();
	req.open('GET', 'http://mp3skip.com/mp3/'+searchterm.replace(/\s/gi,'_')+'.html', false); 
	req.send(null);
	if(req.status == 200){
		var data = req.responseText;
		var url=/<div style="margin-left:8px; float:left;"><a href="(.*?)" rel="nofollow" target="_blank" style="color:green;">Download<\/a><\/div>/gi;
		var name = /<div><b>(.*?) - (.*?) mp3<\/b><\/div>/gi
		while(Ergebnis = name.exec(data)){
			try{
			var address = url.exec(data);
			var matches = new Array(4);
			matches[0] = address[1];
			matches[1] = Ergebnis[1];
			matches[2] = Ergebnis[2];
			matches[3] = "mp3skip.com";
			results.push(matches);
			}catch(e){}
		}
	}
	return results;
}	
//PRO:Good results for most mainstream music%
//CON:Sometimes wrong files%