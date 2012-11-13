/* This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Creative Commons
 * Attribution-NonCommercial-ShareAlike Version 3.0, as published
 * by Creative Commons. See 
 * http://creativecommons.org/licenses/by-nc-sa/3.0/legalcode for
 * more details. */ 

var search = {
	noResults: true,
	lastSearchTerm: '',
	numberOfWorkers: 0,
	worker: new Array(),
	searchCommand: function( searchterm ) {
		this.noResults = true;
		this.lastSearchTerm = searchterm;
		mdc.clearTree("search_treechildren");
		var serviceIndex = mdc.queryDatabase("SELECT * FROM offline WHERE enabled='1'",0);
		var serviceDisabled = mdc.queryDatabase("SELECT * FROM offline WHERE enabled='0'",0);
		for(var i=0; i<serviceDisabled.length; ++i){
			dump("\nSkipping "+serviceDisabled[i]+": disabled in Servicemanager");
		}
		for( var i=0; i<serviceIndex.length; ++i){
			var source = "http://musicdc.sourceforge.net/mdc/services/"+serviceIndex[i];
			this.loadWebScraper(source, searchterm);
		}
		if(serviceIndex.length>0){
			//var statusTooltip = document.getElementById('search-tooltip');
			//var status = document.getElementById("search-statusmessage");
			//status.setAttribute("value", "Searching...");
			//statusTooltip.openPopup(document.getElementById('statusbar'), 'before_end', 0, 0, false, false);
			mdc.showThrobber( "search", true);
			//document.getElementById('search-stop').disabled = false;
		}
		else{
			mdc.openWindow('chrome://mdc/content/options.xul#paneMain', 'Browser:Preferences','chrome,extrachrome,menubar,resizable,scrollbars,status,toolbar');
		}
	},
	
	insertdata: function( content ) {
		/*Writes the results to the tree. Danger: synchronous!*/
		if(typeof(unescape(content[0])) == 'undefined'){
			return;
		}
		
		if(content.length>0){
			this.noResults = false;
		}
		var url = unescape(content[0]);
		var artist = unescape(mdc.removeEntities(content[1].replace(/\+/g," ")).replace(/<(?:.|\s)*?>/g, "").substr(0,80).replace(/&amp;amp;/g, "&"));
		var title = unescape(mdc.removeEntities(content[2].replace(/\+/g," ")).replace(/<(?:.|\s)*?>/g,"").substr(0,80).replace(/&amp;amp;/g, "&"));
		var service = content[3];
		var similarity = Math.max(mdc.round(compare.compareStrings(this.lastSearchTerm, artist+' '+title), 2), mdc.round(compare.compareStrings(this.lastSearchTerm, title+' '+artist), 2));
		var listbox = document.getElementById("search_treechildren");
			var item = document.createElement("richlistitem");
				item.setAttribute("ondblclick", "mdc.play('"+escape(artist)+"', '"+escape(title)+"', '"+escape(url)+"', 'search', null)");
				item.setAttribute("draggable",true);
				item.setAttribute("similarity", similarity);
				var dataArray = new Array(escape(url), escape(artist), escape(title)).join("%2S");
				item.setAttribute("ondragstart", "event.dataTransfer.setData('text/plain', '"+dataArray+"'); event.dataTransfer.effectAllowed = 'copy';");
				item.setAttribute("id", url);
			var item_artist = document.createElement("label");
				item_artist.setAttribute("value", artist);
				//item_artist.setAttribute("width", "600");
			var item_title = document.createElement("label");
				item_title.setAttribute("value", title);
				//item_title.setAttribute("width", "200");
			var item_service = document.createElement("label");
				item_service.setAttribute("value", service);
				//item_service.setAttribute("width", "150");
			var button_download = document.createElement("button");
				button_download.setAttribute("label","Download");
				button_download.setAttribute("height","1px");
				button_download.setAttribute("onclick","var file = mdc.filePicker('save', null, '"+escape(artist)+" - "+escape(title)+".mp3', 'mp3'); mdc.downloadBinaryFile('"+url+"', file);");
			var button_preview = document.createElement("toolbarbutton");
				button_preview.style.listStyleImage = "url('chrome://mdc/skin/icons/speaker.png')";
				button_preview.setAttribute("height","1px");
				button_preview.setAttribute("onclick","mdc.play('"+escape(artist)+"', '"+escape(title)+"', '"+url+"', 'search', null)");
			var match = document.createElement("label");
				match.setAttribute("value", mdc.round(similarity*100, 0)+"%");
			item.appendChild(button_preview);
			item.appendChild(item_artist);
			item.appendChild(item_title);
			item.appendChild(item_service);
			item.appendChild(button_download);
			item.appendChild(match);
			
			if(sampleDownloadObserver.activeDownloads){
				if(sampleDownloadObserver.activeDownloads.indexOf(url) != '-1'){
					button_download.setAttribute('image','chrome://mdc/skin/throbber.apng');
					button_download.setAttribute('label','');
					button_download.setAttribute('disabled', true);
				}
			}
			
			var siblings = listbox.getElementsByTagName('richlistitem').length;
			
			for(var i=0; i<siblings; ++i){
				if(listbox.getElementsByTagName('richlistitem')[i].getAttribute('similarity')<similarity){
					listbox.insertBefore(item, listbox.getElementsByTagName('richlistitem')[i]);
					return;
				}
			}
			listbox.appendChild(item);
	},
	
	/*showSelected: function( mode ) {
		hacky function. Performs all actions that happen upon
		right-click in the Search tree (aka context-menu actions).
		Currently download, download to folder and preview.
		var tree = document.getElementById("search_maintree");
		var rangeCount = tree.view.selection.getRangeCount();
		if( mode == "downloadToFolder"){
			var target = mdc.filePicker("getFolder", null, null, null);
		}
		for (var i = 0; i < rangeCount; i++)
		{
			var start = {};
			var end = {};
			tree.view.selection.getRangeAt(i, start, end);	//download all selected items
			for(var c = start.value; c <= end.value; c++)
			{
				var id = tree.view.getItemAtIndex(c).getAttribute("id");
				var data = id.split("%S");
				var source = data[0];
				var name = data[1]+" - "+data[2]+".mp3";
				dump("\nExtracted source: "+source);
				
				if( mode == "download"){
					var target = mdc.filePicker("save", null, name , "mp3");
					mdc.downloadBinaryFile(source, target);
				}
				if( mode == "preview"){
					mdc.play(unescape(source), data[1]+" - "+data[2], "search", "1");
				}
				if(mode == "downloadToFolder"){
					var tempTarget = target.clone();
					tempTarget.append(name);
					mdc.downloadBinaryFile(source, tempTarget);
				}
			}
		}
	},*/
	
	loadWebScraper: function(url, searchterm){
		/*loads the web scrapers and writes the number to this.numberOfworkers.
		Like this, we always have the full control about how many workers are
		working at the moment (since they are asynchronous) and we can show the
		searchcomplete message when all have finished*/
		this.worker.push(new Worker(url));
		this.worker[this.worker.length-1].onmessage = function(event) {
			search.displayResults(event.data);
		};
		this.worker[this.worker.length-1].postMessage(searchterm);
		this.numberOfWorkers++;
	},
	
	displayResults: function( data ){
		/*Displays the results of the workers and deletes them from
		this.numberOfWorkers. Like this, we always have the full
		control about how many workers are working at the moment
		(since they are asynchronous) and we can show the search-
		complete message when all have finished*/
		for(var i=0; i<data.length;i++){
			this.insertdata(data[i]);
		}
		this.numberOfWorkers--;
		if(this.numberOfWorkers==0){
			//var statusTooltip = document.getElementById('search-tooltip');
			//statusTooltip.hidePopup();
			mdc.searchComplete();
			//mdc.popup("Music Download Center",mdc.searchcomplete);
			//document.getElementById('search-stop').disabled = true;
			if(this.noResults){
				var message = mdc.strings.getFormattedString('extendedlibrary.noResultsFor',[this.lastSearchTerm]);
				var disabled = mdc.queryDatabase("SELECT COUNT(*) FROM offline WHERE enabled=0",0);
				if(disabled>0){		/*services disabled*/
					message+=" "+mdc.strings.getFormattedString('extendedlibrary.tryOtherServices',[disabled]);
					mdc.showMessageBox('FF6666','',message,true,new Array(mdc.open),new Array("mdc.openWindow('chrome://mdc/content/options.xul#paneMain', 'Browser:Preferences','chrome,extrachrome,menubar,resizable,scrollbars,status,toolbar')+'; '+mdc.closeMessageBox"));
				}else{	/*all services enabled*/
					message+=' '+mdc.sendErrorReport;
					mdc.showMessageBox('FF6666','',message,true,new Array(mdc.send),new Array('alert(mdc.getFile("'+mdc.reportURL+'NOTFOUND_'+this.lastSearchTerm+'")); '+mdc.closeMessageBox));
				}
			}else{
				mdc.showMessageBox('33CCFF','',mdc.searchCompleted, true, '','');
			}
			window.getAttention();
		}
	},
};