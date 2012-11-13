onmessage = function(event){
	var searchterm = event.data;
	var results = getLinks(searchterm);
	postMessage(results);
}
function getLinks(searchterm){
	var req = new XMLHttpRequest();
	var results = new Array();
	req.open('GET', 'http://en.vpleer.ru/?q='+escape(searchterm), false); 
	req.send(null);
	if(req.status == 200){
		var data = req.responseText;
		var url=/onclick=\"return play\([0-9]+, '(.*?)', [0-9]{3}, '', 'vpleer\.ru', '(.*?)', '(.*?)'\);/gi;
		//var artistandtitle=/<span class="ausong">(.*?)<\/span> - <span class="auname">(.*?)<\/span>/g;
		while(Ergebnis = url.exec(data)){
			try{
			//Ergebnis2 = artistandtitle.exec(data);
			var matches = new Array(4);
			matches[0] = "http://en.vpleer.ru"+Ergebnis[1];
			matches[1] = Ergebnis[2];
			matches[2] = Ergebnis[3];
			matches[3] = "vpleer.ru";
			results.push(matches);
			}catch(e){}
		}
	}
	return results;
}	
//PRO:Good results for most mainstream music%
//CON:Sometimes wrong files%