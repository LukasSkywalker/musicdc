/*compare.js

	JS implementation of "Strike a match" from http://www.catalysoft.com/articles/StrikeAMatch.html

	public static double compareStrings(String str1, String str2) {}
	private static ArrayList wordLetterPairs(String str) {}
	private static String[] letterPairs(String str) {}
	
	
*/
var compare = {
	letterPairs: function ( str ) {
		var numPairs = str.length-1;
		var pairs = new Array(numPairs);
		for (var i=0; i<numPairs; i++) {
			pairs[i] = str.substring(i,i+2);
		}
		return pairs;
	},
	
	wordLetterPairs: function ( str ) {
       var allPairs = new Array();
       // Tokenize the string and put the tokens/words into an array 
	   var words = str.split("s");
       // For each word
       for (var w=0; w < words.length; w++) {
           // Find the pairs of characters
           var pairsInWord = this.letterPairs(words[w]);
           for (var p=0; p < pairsInWord.length; p++) {
               allPairs.push(pairsInWord[p]);
           }
       }
       return allPairs;
	},
	
	compareStrings: function ( str1, str2 ) {
       var pairs1 = this.wordLetterPairs(str1.toUpperCase());
       var pairs2 = this.wordLetterPairs(str2.toUpperCase());
       var intersection = 0;
       var union = pairs1.length + pairs2.length;
       for (var i=0; i<pairs1.length; i++) {
           var pair1=pairs1[i];
           for(var j=0; j<pairs2.length; j++) {
               var pair2=pairs2[j];
               if (pair1 == pair2) {
                   intersection++;
                   pairs2.splice( j,1 );
                   break;
               }
           }
       }
       return (2.0*intersection)/union;
   }
	
	
};