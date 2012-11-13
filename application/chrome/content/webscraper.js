/* This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Creative Commons
 * Attribution-NonCommercial-ShareAlike Version 3.0, as published
 * by Creative Commons. See 
 * http://creativecommons.org/licenses/by-nc-sa/3.0/legalcode for
 * more details. */ 
 
onmessage = function(event){
	var url = event.data;
	var results = getLinks(url);
	postMessage(results);
}
function getLinks(url) {
	var results = new Array();
	/*var req = new XMLHttpRequest();  
	req.open('GET', 'view-source:'+url, false);   
	req.send(null);
	if(req.status == 200){
		var data = req.responseText;*/
		var data = url;
		var pattern = new Array();
		pattern.push(new RegExp("soundFile=(.*[\.]mp3)[\'|\"]","ig"));			//Skrmr-type
		pattern.push(new RegExp("(http%3A%2F%2.*?[\.]mp3)","ig"));				//encoded URLs
		pattern.push(new RegExp("src=[\'|\"](.*?[\.]mp3)[\'|\"]","ig"));			//src URLs
		pattern.push(new RegExp("href=[\'|\"](.*?[\.]mp3)[\'|\"]","ig"));			//'normal' href URLs
		pattern.push(new RegExp("&amp;file=(.*?)&amp;volume=","ig"));	//zippyshare player
		for( var i=0; i<pattern.length; ++i){
			while(Ergebnis = pattern[i].exec(data)){
				var result = Ergebnis[1];
				if(!result.match("http")){										//Hey! This is a relative URL!
					var temp_url = url.split("/");								//Let's get an array of the URL
					url = url.replace(temp_url[temp_url.length-1],"");			//and replace the part after the last slash with nothing :-)
					result = url+result;										//and append it to the relative URL //### Big L's naughty & nasty hack  ###
				}
				result = result.split('"');
				result = result[result.length-1];
				results.push(unescape(result));
				//Check if the result contains http:// (e.g. <script src='bla.js' url='http://mypage.li/test.mp3'/>)
				var lastResult = results[results.length-1];
				if(lastResult.indexOf("http://")>1){
					results[results.length-1] = lastResult.substr(lastResult.indexOf("http://"));
				}
				for(var y=0; y<results.length-1; y++){
					//Check if the result is already displayed
					if(unescape(results[y]) == unescape(results[results.length-1])){
						results.pop();
					}
				}
			}
			if(results.length>5){
				break;
			}
		}
		
		return results;
	//}
}