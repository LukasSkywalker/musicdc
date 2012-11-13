/* This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Creative Commons
 * Attribution-NonCommercial-ShareAlike Version 3.0, as published
 * by Creative Commons. See 
 * http://creativecommons.org/licenses/by-nc-sa/3.0/legalcode for
 * more details. */ 
 
 var localeswitch={
	onLoad: function () {
		try {
			// Query available and selected locales
		
			var chromeRegService = Components.classes["@mozilla.org/chrome/chrome-registry;1"].getService();
			var xulChromeReg = chromeRegService.QueryInterface(Components.interfaces.nsIXULChromeRegistry);
			var toolkitChromeReg = chromeRegService.QueryInterface(Components.interfaces.nsIToolkitChromeRegistry);
			
			var selectedLocale = xulChromeReg.getSelectedLocale("mdc");
			var availableLocales = toolkitChromeReg.getLocalesForPackage("mdc");
			
			
			// Render locale menulist
			const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
			
			var localeListbox = document.getElementById("locale-listbox");
			
			var localeNames = {ar: "Arabic",de: "German", us:"English (US)", es:"Spanish (Spain)", fr: "French", it: "Italian", jp:"Japanese", br: "Portuguese (Brazilian)", se: "Swedish", cn:"Chinese (Simplified)"};

			var selectedItem = null;
			
			while(availableLocales.hasMore()) {
				
				
				
				/*Locales are in the form pt-BR. We only need the BR part for the
				flag, so split it and make it lowercase. Now.*/
				var locale = availableLocales.getNext();
				
				var listitem = document.createElementNS(XUL_NS, "listitem");
				listitem.setAttribute("value", locale);
				
				listitem.setAttribute("class", "listitem-iconic");
				locale = locale.split("-");
				locale = locale[locale.length-1].toLowerCase();
				
				listitem.setAttribute("label", localeNames[locale]);
				if(locale == "ar") locale = "ae";
				listitem.setAttribute("image", "chrome://mdc/content/flags/" + locale + ".png");
				
				
				if (locale == selectedLocale) {
					// Is this the current locale?
					selectedItem = listitem;
				}
				
				localeListbox.appendChild(listitem);
			}
			
			// Highlight current locale
			localeListbox.selectedItem = selectedItem;
			
		} catch (err) {
		
			alert ("Failed to render locale menulist: " + err);
			
		}
		
	},

	changeLocale: function() {
		try {
			// Which locale did the user select?
			var localeListbox = document.getElementById("locale-listbox");
			var newLocale = localeListbox.selectedItem.value;
			
			// Write preferred locale to local user config
			var prefs = Components.classes["@mozilla.org/preferences-service;1"].
						getService(Components.interfaces.nsIPrefBranch);
			prefs.setCharPref("general.useragent.locale", newLocale);
			
			// Restart application
			var appStartup = Components.classes["@mozilla.org/toolkit/app-startup;1"]
						 .getService(Components.interfaces.nsIAppStartup);
			appStartup.quit(Components.interfaces.nsIAppStartup.eRestart |
							Components.interfaces.nsIAppStartup.eAttemptQuit);
			
		} catch(err) {
		
			alert("Couldn't change locale: " + err);
		}
	},
};
