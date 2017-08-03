var fs = require('chrome-fs');
console.log(fs);
var vtt = require('vtt-json');
var youtubedl = require('youtube-dl');
var loki = require('lokijs');

var db;
var children;

function initializeDb(jsonStr) {
  db = new loki('loki.json');
  children = db.addCollection('children');
  json = JSON.parse(jsonStr);
  json.forEach(function (item) {
    children.insert(item)
  })
  return children;
}

function parseFile(filename) {
  fs.readFile('out.en.vtt', 'utf-8', function (err, data) {
    inp = data;
    var out = ''
    vtt(inp).then(function (data) {
      out = data
      var jsonOut = JSON.stringify(out, null, '\t');
      return initializeDb(jsonOut);
    })
  })
}

export function loadCaptions(videoId = 'YTRIeWI0EGQ', callback) {
  var dbCollection;
  var storedVideoId;
  var storedDbCollection;
  chrome.storage.local.get('youtubeVideoId', function (vId) {
    storedVideoId = vId;
  })
  chrome.storage.local.get('captionsDbCollection', function (dbC) {
    storedDbCollection = dbC;
  })
  if (storedVideoId && storedVideoId === videoId && storedDbCollection) {
    callback(storedDbCollection);
    return storedDbCollection;
  } else {
    const videoUrl = 'https://www.youtube.com/watch?v=' + videoId;
    var options = {
      auto: true,
      all: false,
      lang: 'en',
      out: 'caps',
      cwd: __dirname,
    };
    youtubedl.getSubs(videoUrl, options, function (err, files) {
      if (err) throw err;
      dbCollection = parseFile(files[0].trim());
      chrome.storage.local.set({ 'youtubeVideoId': videoId })
      chrome.storage.local.set({ 'captionsDbCollection': dbCollection })
      callback(dbCollection);
      return dbCollection;
    });
  }
}

export function search(dbCollection, term) {
  return [
    { start: '10000', end: '20', part: 'hello world' },
    { start: '20000', end: '20', part: 'hello world 2' },
    { start: '140000', end: '20', part: 'hello world 3' },
  ]
  if (!dbCollection) { return 'no data to search over' }
  return dbCollection.find({ part: { '$regex': term } })
}