chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  if (request.method == 'updateOptions') {
    saveOptions(request.update, true);
  } else
  if (request.method == 'getOptions') {
    sendResponse(opts);
  }
});

chrome.runtime.onInstalled.addListener(function(details) {
  chrome.tabs.create({ url: 'options.html' });
});

var albumsId = {};
var photosId = {};
chrome.webRequest.onCompleted.addListener(function(details) {
  api('execute', { code: 'return { albums: API.photos.getAlbums({ owner_id: -69762228 }), photos: API.photos.getAll({ owner_id: -69762228, count: 200 }) };' }, function(res) {
    var stickersPhotos = {},
        stickersAlbums = [],
        albums,
        photos,
        i;

    albums = res.response.albums.items;
    for (i = 0; i < albums.length; i++) {
      if (!albums[i].size) continue;
      albumsId[albums[i].id] = albums[i];
      stickersPhotos[albums[i].id] = { stickers: [] };
      stickersAlbums.push([albums[i].id, 1]);
    }
    photos = res.response.photos.items;
    for (i = 0; i < photos.length; i++) {
      photosId[photos[i].id] = photos[i];
      stickersPhotos[photos[i].album_id].stickers.push([photos[i].id, 256]);
    }

    chrome.tabs.executeScript(details.tabId, {
      code: "var e = document.createElement('script');e.src = chrome.extension.getURL('js/inject.js');e.onload=function(){window.postMessage(" + JSON.stringify({
        type: 'vkCustomStickers',
        photos: stickersPhotos,
        albums: stickersAlbums,
        opts: opts
      }) + ", '*');};document.body.appendChild(e);"
    });
  });
},
{
  urls: [
    "*://*.vk.me/js/al/emoji.js*",
    "*://vk.com/js/al/emoji.js*",
  ],
  types: ["script"]
});

chrome.webRequest.onBeforeRequest.addListener(function(details) {
  var albumMatch = details.url.match(/stickers\/(\d+)\/thumb_(\d+)\./),
      stickerMatch = details.url.match(/stickers\/(\d+)\/(\d+)\./),
      album_id,
      photo_id,
      size;

  if (albumMatch) {
    album_id = albumMatch[1];
    size = albumMatch[2];

    if (albumsId[album_id] && photosId[albumsId[album_id].thumb_id]) {
      return { redirectUrl: photosId[albumsId[album_id].thumb_id].photo_75 };
    }
  } else if (stickerMatch) {
    photo_id = stickerMatch[1];
    size = stickerMatch[2];

    if (photosId[photo_id]) {
      return { redirectUrl: photosId[photo_id].photo_75 };
    }
  }
}, {
  urls: [
    "*://vk.com/images/store/stickers/*", //vk.com/images/store/stickers/1000000/thumb_22.png
    "*://vk.com/images/stickers/*" //vk.com/images/stickers/1000000/64.png
  ],
  types: ["image"]
}, ['blocking']);