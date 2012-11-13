onmessage = function(event){
	var searchterm = event.data;
	var results = getLinks(searchterm);
	postMessage(results);
}
function getLinks(searchterm){
	var results = new Array();
	var req = new XMLHttpRequest();  
	req.open('GET', 'http://www.alfamp3.com/music/'+escape(searchterm)+'.html', false);   
	req.send(null);
	var results = new Array(100);
	if(req.status == 200){
		var data = req.responseText;
		var pattern = /<strong><a target="_blank" href="(.*?)">download<\/a><\/strong>/gi;
		var r_url = /<param name=\"FlashVars\" value=\"mp3=(.*?)&amp;showstop=1/gi;
		var r_artist = /Artist: (.*?)\t/gi;
		var r_title = /Title: (.*?)\t/gi;
		var matches = new Array(4);
		while(Ergebnis = pattern.exec(data)){
			matches[0] = Ergebnis[1];
			matches[1] = Ergebnis[1];
			matches[2] = Ergebnis[1];
			matches[0] = "Test";
			results.push(matches);
			/*var req2 = new XMLHttpRequest();
			req2.open('GET','http://www.alfamp3.com'+Ergebnis[1],false);
			req2.send(null);
			if(req2.status == 200){
				try{
				var data2 = req2.responseText;
				var url = r_url.exec(data2);
				var artist = r_artist.exec(data2);
				var title = r_title.exec(data2);
				var matches = new Array(4);
				matches[0] = Ergebnis[1];
				matches[1] = Ergebnis[1];
				matches[2] = Ergebnis[1];
				matches[3] = "alfamp3.com";
				results.push(matches);
				} catch(e) {}
			}*/
		}
	}
	return results;
}