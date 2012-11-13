/* This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Creative Commons
 * Attribution-NonCommercial-ShareAlike Version 3.0, as published
 * by Creative Commons. See 
 * http://creativecommons.org/licenses/by-nc-sa/3.0/legalcode for
 * more details. */ 
 
 // nsIWebProgressListener implementation to monitor activity in the browser.
function WebPL() {
}

WebPL.prototype = {
  _requestsStarted: 0,
  _requestsFinished: 0,
  _targetUID: 0,

  setUID: function( uid ){
	this._targetUID = uid;
  },
  // We need to advertize that we support weak references.  This is done simply
  // by saying that we QI to nsISupportsWeakReference.  XPConnect will take
  // care of actually implementing that interface on our behalf.
  QueryInterface: function(iid) {
    if (iid.equals(Components.interfaces.nsIWebProgressListener) ||
        iid.equals(Components.interfaces.nsISupportsWeakReference) ||
        iid.equals(Components.interfaces.nsISupports))
      return this;
    
    throw Components.results.NS_ERROR_NO_INTERFACE;
  },

  // This method is called to indicate state changes.
  onStateChange: function(webProgress, request, stateFlags, status) {
	var browser = document.getElementById("tabbed-browser");
	var contentTitle = browser.getBrowserByUID(this._targetUID).contentTitle;
	if(contentTitle.length>33){
		contentTitle = contentTitle.substring(0,30)+"...";
	}
	browser.changeTabLabel(browser.getTabIndexByUID(this._targetUID), contentTitle);
      
		if(browser.currentUID == this._targetUID){
		const WPL = Components.interfaces.nsIWebProgressListener;
	
	var progress = document.getElementById("browser-progress");

    if (stateFlags & WPL.STATE_IS_REQUEST) {
      if (stateFlags & WPL.STATE_START) {
        this._requestsStarted++;
      } else if (stateFlags & WPL.STATE_STOP) {
        this._requestsFinished++;
      }
      if (this._requestsStarted > 1) {
        var value = (100 * this._requestsFinished) / this._requestsStarted;
        progress.setAttribute("mode", "determined");
        progress.setAttribute("value", value + "%");
		
      }
    }

    if (stateFlags & WPL.STATE_IS_NETWORK) {
      var stop = document.getElementById("stop-button");
	  var reload = document.getElementById("reload-button");
	  var browserStatusbar = document.getElementById("browser-statusbar");
      if (stateFlags & WPL.STATE_START) {
		stop.setAttribute("hidden",false);
		reload.setAttribute("hidden",true);
		browserStatusbar.setAttribute("hidden", false);
      } else if (stateFlags & WPL.STATE_STOP) {
		stop.setAttribute("hidden",true);
		reload.setAttribute("hidden",false);
		//browserStatusbar.setAttribute("hidden", true);
		stop.setAttribute("mode", "reload");
		stop.setAttribute("oncommand","mybrowser.reload();");
        progress.setAttribute("hidden", true);
		document.getElementById("browser-statusmessage").value = "";
		mdc.showThrobber("internet", false);
        this.onStatusChange(webProgress, request, 0, "Done");
        this._requestsStarted = this._requestsFinished = 0;
      }
      }
    }
  },


	onProgressChange: function(webProgress, request, curSelf, maxSelf,
                             curTotal, maxTotal) {
		var browser = document.getElementById('tabbed-browser');
		if(browser.currentUID == this._targetUID){
			if(this._requestsStarted == this._requestsFinished){
				document.getElementById('browser-statusbar').setAttribute('hidden', true);
			}else{
				document.getElementById('browser-statusbar').setAttribute('hidden', false);
			}
			if (this._requestsStarted == 1) {
			var progress = document.getElementById("browser-progress");
			if (maxSelf == -1) {
				progress.setAttribute("mode", "undetermined");
			} else {
				progress.setAttribute("mode", "determined");
				progress.setAttribute("value", ((100 * curSelf) / maxSelf) + "%");
			}
		}
		}else{
		 document.getElementById('browser-statusbar').setAttribute('hidden', true);
		}
	},

  // This method is called to indicate a change to the current location.
  onLocationChange: function(webProgress, request, location) {
    var browser = document.getElementById('tabbed-browser');
		if(browser.currentUID == this._targetUID){
		mdc.clearTree("webscraper_rows");
	document.getElementById("webscraper_splitter").setAttribute("state","collapsed");
	var urlbar = document.getElementById("urlbar");
	if(urlbar.value.length == urlbar.selectionEnd-urlbar.selectionStart){
		urlbar.value = location.spec;
		urlbar.select();
	}else{
		urlbar.value = location.spec;
	}
	

    var browser = document.getElementById("tabbed-browser").currentBrowser;
    var back = document.getElementById("back-button");
    var forward = document.getElementById("forward-button");	
    var progress = document.getElementById('browser-progress');	
	progress.setAttribute('hidden',false);
    back.setAttribute("disabled", !browser.canGoBack);
    forward.setAttribute("disabled", !browser.canGoForward);
	}
  },

  // This method is called to indicate a status changes for the currently
  // loading page.  The message is already formatted for display.
  onStatusChange: function(webProgress, request, status, message) {
    var browser = document.getElementById('tabbed-browser');
		if(browser.currentUID == this._targetUID){
		var statusbar = document.getElementById("browser-statusbar");
	var status = document.getElementById("browser-statusmessage");


	status.setAttribute("value", message);
	if(message == "Done"){
		statusbar.setAttribute('hidden', true);
	}else{
		
	}
	}
  },

  // This method is called when the security state of the browser changes.
  onSecurityChange: function(webProgress, request, state) {
    var browser = document.getElementById('tabbed-browser');
		if(browser.currentUID == this._targetUID){
		const WPL = Components.interfaces.nsIWebProgressListener;

    var sec = document.getElementById("security");

    if (state & WPL.STATE_IS_INSECURE) {
      sec.setAttribute("style", "display: none");
    } else {
      var level = "unknown";
      if (state & WPL.STATE_IS_SECURE) {
        if (state & WPL.STATE_SECURE_HIGH)
          level = "high";
        else if (state & WPL.STATE_SECURE_MED)
          level = "medium";
        else if (state & WPL.STATE_SECURE_LOW)
          level = "low";
      } else if (state & WPL_STATE_IS_BROKEN) {
        level = "mixed";
      }
      sec.setAttribute("value", "Security: " + level);
      sec.setAttribute("style", "");
    }
  }
  }
};


var mybrowser = {
	homePage: "http://musicdc.sourceforge.net/home",
	progressListener: new WebPL(),
	
	goHome: function(){
		var browser = document.getElementById("tabbed-browser");
		if(browser.getTabCount() == 0){
			browser.addTab('','',null, null, true)
		}
		browser.currentBrowser.loadURI('http://musicdc.sourceforge.net/home',null,null);
	},
	
	goTo: function( aURL ){
		var browser = document.getElementById("tabbed-browser");
		if(browser.getTabCount() == 0){
			browser.addTab('','',null, null, true)
		}
		browser.currentBrowser.loadURI(aURL,null,null);
		
	},
	
	onTabChange: function ( startup ){
		var currentBrowser = document.getElementById("tabbed-browser").currentBrowser;
		if(document.getElementById("tabbed-browser").getTabCount() == 0){
			document.getElementById('urlbar').value = '';
			document.getElementById('tabbed-browser').addTab('','','');
		}
		document.getElementById('browser-statusbar').setAttribute('hidden', true);
		var urlbar = document.getElementById('urlbar');
		if(currentBrowser.currentURI != null){
				urlbar.value = currentBrowser.currentURI.spec;
				urlbar.select();
		}
		urlbar.select();
		
		document.getElementById('browser-progress').value = 0;
		document.getElementById('browser-statusmessage').value = '';
	
	},
	
	addPL: function( uid ){
			document.getElementById('tabbed-browser').currentBrowser.progressListener = new WebPL;
			document.getElementById('tabbed-browser').currentBrowser.addProgressListener(document.getElementById('tabbed-browser').currentBrowser.progressListener, Components.interfaces.nsIWebProgress.NOTIFY_ALL);
			document.getElementById('tabbed-browser').currentBrowser.progressListener.setUID(uid);
			dump('WPL was added for new tab: UID='+uid);
	},

	back: function() {
	  var browser = document.getElementById("tabbed-browser");
	  browser.currentBrowser.stop();
	  browser.currentBrowser.goBack();
	},
	
	forward: function() {
	  var browser = document.getElementById("tabbed-browser");
	  browser.currentBrowser.stop();
	  browser.currentBrowser.goForward();
	},
	
	reload: function() {
	  var browser = document.getElementById("tabbed-browser");
	  browser.currentBrowser.reload();
	},

	stop: function() {
	  var browser = document.getElementById("tabbed-browser");
	  browser.currentBrowser.stop();
	},

	onload: function() {
		var urlbar = document.getElementById("urlbar");
		urlbar.value = mybrowser.homePage;
		
		var browser = document.getElementById("tabbed-browser");
		if(browser.getTabCount()==0){
			browser.addTab(mybrowser.homePage,'','',null,true);
		}
				
		mdc.browser_init = true;	//no onload at 2nd load
	},


	loadWebScraper: function(url){
		var worker = new Worker("webscraper.js");
		worker.onmessage = function(event) {
			mybrowser.displayResults(event.data);
		};
		worker.postMessage(url);
	},
	
	/**
	 * Displays the results from the webscraper web worker.
	 * @param array data An array of the results
	*/
	displayResults: function(data){
		var splitter = document.getElementById("webscraper_splitter");
		var listbox = document.getElementById("webscraper_listbox");
		//var urlbar = document.getElementById("urlbar");
		if(data){
			if(data.length>0){
				if(splitter.getAttribute("state") =="collapsed"){
					splitter.setAttribute("state", "open");
				}
				for(var i=0; i<data.length;++i){
					var filename = unescape(data[i]).split("/");
					filename = filename[filename.length-1];
					var listbox = document.getElementById("webscraper_rows");
					var item = document.createElement("richlistitem");
						item.setAttribute("id", data[0]);
					var button_preview = document.createElement("toolbarbutton");
						button_preview.style.listStyleImage = "url('chrome://mdc/skin/icons/speaker.png')";
						button_preview.setAttribute("height","1px");
						button_preview.setAttribute("onclick","mdc.play('"+mdc.getTagsFromFilename(data[i])[0]+"', '"+mdc.getTagsFromFilename(data[i])[1]+"','"+data[i]+"', 'browser', null)");
					var label = document.createElement("label");
						label.setAttribute("value", filename);
						label.setAttribute("flex", "1");
					var button = document.createElement("button");
						button.setAttribute("label","Download");
						button.setAttribute("id", data[i]);
						button.setAttribute("height","1px");
						button.setAttribute("onclick","var file = mdc.filePicker('save', null, '"+filename+"', 'mp3'); mdc.downloadBinaryFile('"+unescape(data[i])+"', file);");
					item.appendChild(button_preview);
					item.appendChild(label);	//mdc.downloadBinaryFile('"+data[i]+"', "+file+");
					item.appendChild(button);
					listbox.appendChild(item);
				}
			}
		}
	},
};



//addEventListener("load", mybrowser.onload, false);