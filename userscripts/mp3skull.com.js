onmessage = function(event){
	var searchterm = event.data;
	var results = getLinks(searchterm);
	postMessage(results);
}
function getLinks(searchterm){
    var results = new Array();
    var req = new XMLHttpRequest();
    req.open('GET', "http://mp3skull.com/mp3/" + searchterm.replace(" ", "_") + ".html", false); 
    req.send(null);
    if(req.status == 200){
      var data = req.responseText;
      var urlPattern = /<a href=\"(.*?.mp3)\" rel=\"nofollow\"/gi;
      var namePattern = /<div style=\"font-size:15px;\"><b>(.*?) mp3<\/b><\/div>/gi;
      var Ergebnis,Ergebnis2;
      while(Ergebnis = urlPattern.exec(data)){
        /*var matches = new Array(4);
        matches[0] = Ergebnis[1];
        matches[1] = Ergebnis[1];
        matches[2] = Ergebnis[1];
        matches[3] = "mp3skull.com";
        results.push(matches);*/
        
        Ergebnis2 = namePattern.exec(data);
        var name = Ergebnis2[1];
        var tags = getArtistAndTitle(name);
        
        var matches = new Array(4);
        matches[0] = Ergebnis[1];
        matches[1] = tags[0];
        matches[2] = tags[1];
        matches[3] = "mp3skull.com";
        //if( matches[0].indexOf("4shared.com") == -1) //do not show 4shared since it's broken
		results.push(matches); 
        
      }
    }
    return results;
}

function getArtistAndTitle( name )
{
    var artist = "";
    var title = "";

    replaceNumbersAndExtension(name);

    name = unescape(name);

    name = trim(name);

    var count = name.length - name.replace("-", "").length + 1;     // count parts of string separated by dash

    if(count == 1)
    {                                           // John Wayne Heaven
        var len = name.split(" ").length;                  // split at space
        if(len == 1)
        {                                         // Ex. JohnWayneHeaven
            artist = name;
            title = "";
        }
        else if(len > 1)                                      // Ex. JohnWayne Heaven or John Wayne Heaven
        {
            var nameArray = name.split(" ");
            for(var i = 0; i < len; i++)
            {
                if(i < len / 2)
                {
                    artist += nameArray[i];
                }
                else
                {
                    title += nameArray[i];
                }
            }
        }
    }
    else if(count == 2)
    {                                      // John Wayne - Heaven
        artist = name.split("-")[0];
        title = name.split("-")[1];
    }
    else if(count > 2)
    {                                        // John Wayne - Heaven - Live at Brixton Academy
        var parts = name.split("-");
        var len = parts.length;
        for(var i = 0; i < len; i++)
        {
            if(i < len / 2)
            {
                artist += parts[i];
            }
            else
            {
                title += parts[i];
            }
        }
    }

    artist = artist.replace("_", " ");
    title = title.replace("_", " ");

    artist = uppercaseWords(artist);
    title = uppercaseWords(title);


    artist = trim(artist);
    title = trim(title);

    artist = replaceNumbersAndExtension(artist);
    title = replaceNumbersAndExtension(title);

    artist = trim(artist);
    title = trim(title);

    return new Array( artist, title );
}

function replaceNumbersAndExtension( name )
{
    var pattern = "^[0-9]{1,3}?\\.(\\s+)?";                     // replace leading track number (01. or 1. or 12. )
    var rgx = new RegExp(pattern);
    name = name.replace(rgx, "");

    var pattern2 = "[0-9]{1,3}?[\\s]*-(\\s+)?";                 // replace leading track number (01- or 1 - or 12- )
    var rgx2 = new RegExp(pattern2);
    name = name.replace(rgx2, "");

    var pattern3 = "(\\.wma|\\.mp3|\\.mid)";                        // replace file ext. (.mp3)
    var rgx3 = new RegExp(pattern3, "i");
    name = name.replace(rgx3, "");

    var pattern4 = "\\([0-9]+[|\\.|-]?\\)";                  // replace number in brackets ((13.) (09) (11))
    var rgx4 = new RegExp(pattern4);
    name = name.replace(rgx4, "");

    var pattern1 = "^[0-9]{1,3}(\\s+)?";                     // replace leading track number (01 or 1 or 12 )
    var rgx1 = new RegExp(pattern1);
    name = name.replace(rgx1, "");
    return name;
}

function trim(str){
  return str.replace(/^\s+/, '').replace(/\s+$/, '');
}

function uppercaseWords(str){
    return str.charAt(0).toUpperCase() + str.slice(1);
}
//PRO:Probably the best service. Many good results%
//CON:Nothing%