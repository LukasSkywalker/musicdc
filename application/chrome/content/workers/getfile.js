onmessage = function(event){
	var req = new XMLHttpRequest();  
		req.open('GET', 'http://www.google.com', false); 
		req.send(null);
		if(req.status == 200){
			postMessage(true);
		}else{
			postMessage(false);
		}
}