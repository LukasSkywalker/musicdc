onmessage = function(event){
	var searchterm = event.data;
	var results = getLinks(searchterm);
	postMessage(results);
}
function getLinks(searchterm){
    var results = new Array();
    var req = new XMLHttpRequest();
    req.open('GET', 'http://en.dilandau.com/download_music/'+escape(searchterm)+'-1.html', false); 
    req.send(null);
    if(req.status == 200){
      var data = req.responseText;
      var pattern=/file : \"(.*?\.mp3)\"/gi;
      var artist=/artist : \"(.*?)\",/gi;
      var title=/title : \"(.*?)\",/gi;
      var Ergebnis,Ergebnis2,Ergebnis3;
      while(Ergebnis = pattern.exec(data)){
        try{
            Ergebnis2 = title.exec(data);
            Ergebnis3 = artist.exec(data);
            var matches = new Array(4);
            matches[0] = Ergebnis[1];
            matches[1] = Ergebnis3[1];
            matches[2] = Ergebnis2[1];
            matches[3] = "dilandau.com";
            if(matches[0].indexOf("4shared.com") == -1 ) results.push(matches);
        }
        catch(e){}
      }
    }
    return results;
}	
//PRO:Very accurate results%
//CON:Not very many results%