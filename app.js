/*
    Requires: node.js
    Run: node app.js > tests.txt to check out the results
 */

var config = {
    stopLength: 4, //Minimum number of characters a word must have to be included in the index
}

var StringUtils = function () {

    /**
    * Removes all punctuation that we don't want to affect our indexing
    * @param  {string} str String to have punctuation removed
    * @return {string}     String with punctuation removed
    */
    var _removePunctuation = function (str) {
        return str
            .replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"")
            .replace(/\s{2,}/g," ");
    };

    //Simple for now
    var _removeHTML = function(str) {
         var regex = /(<([^>]+)>)/ig;
         return str.replace(regex, '')
    };

    var _parseURL = function(url) {
        return require("url").parse(url);
    }

    //Public properties
    return {
        removePunctuation: _removePunctuation,
        removeHTML: _removeHTML,
        parseURL: _parseURL
    };
}();

var DocumentIndex = function(_document, stopLength) {
    var that = this;

    this.document = _document;
    this.index = null;

    if(!stopLength) stopLength = config.stopLength;

    /**
     * Returns a map of each word to number of occurences and position
     * @param  {string} doc The document to be indexed
     * @return {Object} Object with each word mapped and the positions at which it occurs
     */
    var _indexWords = function(_doc){
        var 
            doc = _doc || that.document,
            map = {}, 
            words = StringUtils.removePunctuation(doc).split(" "), 
            word;

        for(var i in words){

            if(words[i].length <= stopLength) continue;

            word = words[i].toLowerCase();

            if(!map[word]) {
                map[word] = {
                    count: 1, 
                    positions: [i] 
                };
            }
            else {
                map[word].count++;
                map[word].positions.push(i);
            }
        }

        return that.index = map;
    };

    var _setDocument = function (doc) {
        that.document = doc;
        that.index = null;
    };

    var _countSort = function(a, b){
        return b.count - a.count;
    }

    var _positionSort = function(a, b) {
        return (a.positions[0] - b.positions[0]) + (b.count - a.count);
    }

    var _sortByCount = function(max){
        var arr = _objectToArray(that.index);
        max = max || arr.length;
        return arr.sort(_countSort).splice(0,max);
    }

    var _sortByPositions = function(max){
        var arr = _objectToArray(that.index);
        max = max || arr.length;
        return arr.sort(_positionSort).splice(0,max);
    }

    var _getIndex = function(){
        return that.index = that.index || _indexWords();
    };

    var _objectToArray = function(obj){
        var ret = new Array();
        for(var i in obj) {
            obj[i].word = i;
            ret.push(obj[i]);
        }
        return ret;
    }

    return {
        indexWords: _indexWords,
        getIndex: _getIndex,
        setDocument: _setDocument,
        sortByCount: _sortByCount,
        sortByPositions: _sortByPositions
    };
};

var HTTPDocument = function() {
    var http = require("http");
    var doc = "";

    var _get = function(url, done) {
        console.log(url);

        url = StringUtils.parseURL(url);

        var options = {
            hostname: url.hostname,
            port: url.port || 80,
            path: url.path,
            method: url.method || 'GET'
        };


        var req = http.request(options, function(res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                doc += chunk;
            });

            res.on("end", function(err){
                return done(err, StringUtils.removeHTML(doc));
            });
        });

        req.on('error', function(err) {
            console.log('problem with request: ' + e.message);
            return done(err, null);
        });

        req.end();
    };

    return {
        get: _get
    }
}();

var Tests = function(){

    var printResults = function(err, doc){
        if(err) return console.log("Error: " + err);

        var urlIndex = new DocumentIndex(doc);
        urlIndex.indexWords();

        console.log(urlIndex.sortByCount(5));
        console.log(urlIndex.sortByPositions(5));
    };

    console.log("Lorem ipsum tests: ");
    printResults(null,"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sollicitudin porttitor orci, quis consequat eros vestibulum in. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nam sed purus ipsum, vel commodo dui. Aliquam lacinia risus nec tellus tristique sed pretium arcu congue. Nunc tincidunt lobortis tincidunt. Mauris suscipit, diam et facilisis placerat, eros nibh feugiat arcu, sit amet vulputate eros lorem sed eros. Suspendisse ac ante nec elit lacinia consectetur quis id tellus. Praesent laoreet orci et massa ultricies euismod. Integer facilisis, quam fringilla euismod suscipit, dolor eros euismod metus, ac consectetur magna magna et velit. Nulla facilisi. Sed facilisis lobortis nulla sed pharetra. Maecenas vitae ligula libero. Nulla id varius purus. Aliquam pharetra ante in lectus ultricies ut aliquam lectus malesuada. Etiam id mi elit. Proin eu nibh id nunc porta sollicitudin commodo eget leo. Praesent purus velit, scelerisque eu tincidunt et, lacinia eu enim. Nunc lacinia eleifend nisl eu consectetur. Maecenas id convallis nisi. Morbi at magna nec urna facilisis tincidunt. Vestibulum ac orci mauris, eget dictum tellus. Integer a dolor ut mauris aliquet posuere faucibus id risus. Sed vitae arcu vel ligula ornare lobortis. Morbi bibendum eros non tortor vestibulum vel blandit massa ultricies. Proin at arcu magna, at sagittis nibh. Phasellus vitae ante urna, at malesuada justo. Etiam felis massa, suscipit tincidunt scelerisque a, sodales id nulla. Curabitur eu neque at turpis rhoncus placerat. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aenean ac mauris vel velit sagittis scelerisque. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Donec ullamcorper, lectus nec viverra accumsan, ante odio cursus enim, eget scelerisque leo enim vitae purus. Pellentesque ipsum augue, pretium quis egestas eu, venenatis eget metus. Maecenas dictum pretium dolor, bibendum blandit nisi posuere vel. Ut consectetur suscipit lobortis. Donec tempus porttitor ante sit amet blandit. Morbi tristique tempor condimentum. Pellentesque dignissim, odio ac sollicitudin semper, dolor urna placerat est, fringilla accumsan mauris est at justo. Vestibulum consequat luctus sapien sit amet sodales. Proin molestie iaculis nulla, vitae volutpat mauris feugiat nec. Nam faucibus rhoncus tellus at porttitor. Cras ac nunc diam. Fusce vitae sem arcu, iaculis hendrerit velit. Ut id turpis dolor, at faucibus sem. Vestibulum quis posuere mi. Morbi sit amet cursus nisi. Donec ultricies nibh ac augue molestie ac tristique elit varius. Nulla id enim sit amet eros lacinia vestibulum eget vel erat. Praesent in dictum libero. Proin et massa velit.");
    printResults(null,"Suspendisse nec nulla quis velit malesuada eleifend. Ut bibendum eros eget felis aliquam ultricies. Ut porta, lacus a iaculis faucibus, quam urna congue sapien, mattis placerat dui libero at dolor. Phasellus a libero a est ultricies accumsan. Quisque in ullamcorper neque. Etiam pulvinar, sapien ac mollis laoreet, arcu augue egestas ante, in adipiscing ante nisi sit amet erat. Curabitur tincidunt consectetur rhoncus. Pellentesque iaculis enim eget arcu adipiscing porta. Pellentesque ligula neque, tempus nec sollicitudin id, tempor volutpat dui. Morbi erat orci, aliquam in consequat nec, pellentesque eget leo. Morbi fringilla, lacus vitae tincidunt fringilla, lectus nibh semper lectus, eget rutrum mi risus ut nisi. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce ultricies cursus diam, vel sodales ligula tristique eleifend. Pellentesque at iaculis metus. Etiam tempus nulla eu augue tincidunt et sollicitudin ipsum tempor. Integer interdum dui dui, in vehicula nisi. Suspendisse sem massa, interdum at adipiscing nec, gravida at ipsum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Praesent condimentum, tortor a euismod varius, tortor arcu vestibulum eros, non ultricies enim tellus ac nibh. Vestibulum vulputate iaculis leo, id semper felis molestie id. Etiam gravida felis molestie nibh egestas consequat. Mauris dignissim dapibus sapien at consequat. Phasellus a vulputate nisl. Nam id velit id neque feugiat eleifend. Ut quis est tellus, non rhoncus nunc. Proin quis neque felis, laoreet pulvinar quam. Ut metus diam, placerat quis tincidunt vel, viverra porttitor risus. Maecenas et ante velit. Aliquam porttitor, tortor et dignissim consequat, justo enim ultrices felis, convallis iaculis ligula metus molestie odio. Duis id velit diam, sed blandit elit. Nam scelerisque, tortor sagittis bibendum varius, est nulla aliquam turpis, vel bibendum nisi velit sit amet lorem. Etiam ligula purus, mollis sed fermentum eget, feugiat vel elit. Proin pretium, sem aliquet consequat lobortis, erat nisi molestie dolor, in sodales erat mauris eu massa.");

    console.log("\n\nWeb tests: ");
    HTTPDocument.get("http://www.livefyre.com/about/", printResults);
    HTTPDocument.get("http://www.google.com/about/", printResults);
    HTTPDocument.get("http://www.ayloo.net", printResults);
    HTTPDocument.get("http://vegasseven.com/feature/2013/01/17/meet-startups", printResults);
}();

