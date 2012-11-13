pref("toolkit.defaultChromeURI", "chrome://mdc/content/main.xul");
pref("toolkit.singletonWindowType", "musicdownloadcenter");
pref("general.useragent.extra.firefox","Mozilla/5.0 (Windows NT 6.1; rv:2.0b7pre) Gecko/20100919 Firefox/4.0b7pre");
pref("browser.formfill.enable",true);
pref("browser.chrome.toolbar_tips",false);
pref("devtools.errorconsole.enabled",true);

pref("application.firstrun.enabled",true);

pref("browser.helperApps.deleteTempFileOnExit", true);

pref("dom.min_timeout_value", 4);

/*OSX no-quit-on-close*/
pref("browser.hiddenWindowChromeURL", "chrome://mdc/content/hiddenWindow.xul");

/* debugging prefs */
pref("browser.dom.window.dump.enabled", true);
pref("javascript.options.showInConsole", true);
pref("javascript.options.strict", true);
pref("nglayout.debug.disable_xul_cache", true);
pref("nglayout.debug.disable_xul_fastload", true);

/* added to allow <label class="text-links" ... /> to work */
pref("network.protocol-handler.expose.http", false);
pref("network.protocol-handler.warn-external.http", false);


/* enable extension manager*/
pref("xpinstall.dialog.confirm", "chrome://mozapps/content/xpinstall/xpinstallConfirm.xul");
pref("xpinstall.dialog.progress.skin", "chrome://mozapps/content/extensions/extensions.xul?type=themes");
pref("xpinstall.dialog.progress.chrome", "chrome://mozapps/content/extensions/extensions.xul?type=extensions");
pref("xpinstall.dialog.progress.type.skin", "Extension:Manager-themes");
pref("xpinstall.dialog.progress.type.chrome", "Extension:Manager-extensions");
pref("extensions.update.enabled", true);
pref("extensions.update.interval", 86400);
pref("extensions.dss.enabled", false);
pref("extensions.dss.switchPending", false);
pref("extensions.ignoreMTimeChanges", false);
pref("extensions.logging.enabled", false);
pref("general.skins.selectedSkin", "classic/1.0");
// NB these point at AMO
pref("extensions.update.url", "chrome://mozapps/locale/extensions/extensions.properties");
pref("extensions.getMoreExtensionsURL", "chrome://mozapps/locale/extensions/extensions.properties");
pref("extensions.getMoreThemesURL", "chrome://mozapps/locale/extensions/extensions.properties");

pref("app.releaseNotesURL", "http://musicdc.sourceforge.net/releasenotes.php?version=%VERSION%");

// Whether or not app updates are enabled
pref("app.update.enabled", true);
pref("app.update.auto", true);

// Defines how the Application Update Service notifies the user about updates:
//
// AUM Set to:        Minor Releases:     Major Releases:
// 0                  download no prompt  download no prompt
// 1                  download no prompt  download no prompt if no incompatibilities
// 2                  download no prompt  prompt
//
// See chart in nsUpdateService.js.in for more details
//
pref("app.update.mode", 1);

// If set to true, the Update Service will present no UI for any event.
pref("app.update.silent", false);

// Update service URL:
// You do not need to use all the %VAR% parameters. Use what you need, %PRODUCT%,%VERSION%,%BUILD_ID%,%CHANNEL% for example
pref("app.update.url", "http://musicdc.sourceforge.net/update.php?os=%BUILD_TARGET%&version=%VERSION%");

// URL user can browse to manually if for some reason all update installation attempts fail.
pref("app.update.url.manual", "http://musicdc.sourceforge.net/wordpress/?page_id=55");

// A default value for the "More information about this update" link
pref("app.update.url.details", "http://musicdc.sourceforge.net/wordpress/?cat=5");

// User-settable override to app.update.url for testing purposes.
pref("app.update.url.override", "");

// Interval: Time between checks for a new version (in seconds)
//           default=1 day
pref("app.update.interval", 1200);

// Interval: Time before prompting the user to download a new version that
//           is available (in seconds) default=1 day
pref("app.update.nagTimer.download", 500);

// Interval: Time before prompting the user to restart to install the latest
//           download (in seconds) default=30 minutes
pref("app.update.nagTimer.restart", 500);

// Interval: When all registered timers should be checked (in milliseconds)
//           default=5 seconds
pref("app.update.timer", 5);

// Whether or not we show a dialog box informing the user that the update was
// successfully applied. This is off in Firefox by default since we show a
// upgrade start page instead! Other apps may wish to show this UI, and supply
// a whatsNewURL field in their brand.properties that contains a link to a page
// which tells users what's new in this new update.
pref("app.update.showInstalledUI", true);

// 0 = suppress prompting for incompatibilities if there are updates available
//     to newer versions of installed addons that resolve them.
// 1 = suppress prompting for incompatibilities only if there are VersionInfo
//     updates available to installed addons that resolve them, not newer
//     versions.
pref("app.update.incompatible.mode", 0);

/* Don't inherit OS locale */
pref("intl.locale.matchOS", "false");

/* Choose own fallback locale; later it can be overridden by the user */
pref("general.useragent.locale", "en-US");

pref("network.protocol-handler.expose.http", true);
pref("network.protocol-handler.expose.https",true);


pref("browser.download.useDownloadDir", true);
pref("browser.download.folderList", 0);
pref("browser.download.manager.showAlertOnComplete", true);
pref("browser.download.manager.showAlertInterval", 2000);
pref("browser.download.manager.retention", 2);
pref("browser.download.manager.showWhenStarting", true);
pref("browser.download.manager.useWindow", true);
pref("browser.download.manager.closeWhenDone", true);
pref("browser.download.manager.openDelay", 0);
pref("browser.download.manager.focusWhenStarting", false);
pref("browser.download.manager.flashCount", 2);
//
pref("alerts.slideIncrement", 1);
pref("alerts.slideIncrementTime", 10);
pref("alerts.totalOpenTime", 4000);
pref("alerts.height", 50);


pref("signon.rememberSignons", true);
pref("signon.expireMasterPassword", false);
pref("signon.SignonFileName", "signons.txt");

pref("app.services.indexURL","http://musicdc.sourceforge.net/mdc/services/index.txt");
pref("app.services.workerURL","http://musicdc.sourceforge.net/mdc/services/");
pref("app.services.reportURL","http://dieners.di.funpic.de/mdc/report-url.php?url=");
pref("app.services.messageURL","http://musicdc.sourceforge.net/mdc/messages.xml");
