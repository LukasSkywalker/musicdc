onmessage = function(event){
	var searchterm = event.data;
	var results = getLinks(searchterm);
	postMessage(results);
}
function getLinks(searchterm){
	var req = new XMLHttpRequest();
	var results = new Array();
	req.open('GET', 'http://www.musicbiatch.com/music/'+searchterm.replace(/\s/ig, "-")+'/', false); 
	req.send(null);
	if(req.status == 200){
		var data = req.responseText;
		var pattern=/<span class="dlink"><a href="\/download\.php\?(&)?src=[0-9]&link=(.*?)&name=(.*?) - (.*?)">Download<\/a><\/span>/gi;
		while(Ergebnis = pattern.exec(data)){
			try{
				var matches = new Array(4);
				matches[0] = Ergebnis[2];
				matches[1] = Ergebnis[3];
				matches[2] = Ergebnis[4];
				matches[3] = "musicbiatch.com";
				results.push(matches);
			}
			catch(e){}
		}
	}
	return results;
}	
//PRO:Very accurate results, often cool remixes%
//CON:Not very much results%