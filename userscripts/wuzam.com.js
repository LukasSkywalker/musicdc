onmessage = function(event){
	var searchterm = event.data;
	var results = getLinks(searchterm);
	postMessage(results);
}
function getLinks(searchterm){
	var pagenumber = "1";
	var results = new Array();
	while (pagenumber<20){
		var req = new XMLHttpRequest();  
		req.open('GET', 'http://www.wuzam.com/mp3/'+searchterm.replace(" ","-")+'-mp3-download?page='+pagenumber, false);   
		req.send(null);
		if(req.status == 200){
			var data = req.responseText;
			var pattern = new RegExp('artist=(.*?)&title=(.*?)"', 'g');
			var urlPattern = new RegExp('[0-9]{6},"(.*?)"','g');
			while(Ergebnis = pattern.exec(data)){
				try{
				var matches = new Array(4);
				var url = urlPattern.exec(data);
				matches[0] = url[1];
				matches[1] = Ergebnis[1];
				matches[2] = Ergebnis[2];
				matches[3] = "wuzam.com";
				results.push(matches);
				}
				catch(e){}
			}
		}
		pagenumber++;
	}
	return results;
}
//PRO:Many songs%
//CON:Wrong filenames%