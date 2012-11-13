onmessage = function(event){
	var req = new XMLHttpRequest();  
		req.open('GET', event.data, false);
		req.send(null);
		if(req.status == 200){
			postMessage(req.responseText);
		}else{
			postMessage(false);
		}
}