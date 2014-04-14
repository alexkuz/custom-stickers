kango.addMessageListener('updateOptions', function(event) {
  saveOptions(event.data.update, true);
});

kango.addMessageListener('getOptions', function(event) {
    event.source.dispatchMessage('setOptions', opts);
});

var albumsId = {};
var photosId = {};

kango.browser.addEventListener(kango.browser.event.DOCUMENT_COMPLETE, function(event) {
  if (!/https?:\/\/vk.com/.test(event.url)) {
    return;
  }

  api('execute', { code: 'return { albums: API.photos.getAlbums({ owner_id: -69762228 }), photos: API.photos.getAll({ owner_id: -69762228, count: 200 }) };' }, function(res) {
    var stickersPhotos = {},
        stickersAlbums = [],
        albums,
        photos,
        i;

    albums = res.response.albums.items;
    photos = res.response.photos.items;

    for (i = 0; i < photos.length; i++) {
      photosId[photos[i].id] = photos[i];
    }

    for (i = 0; i < albums.length; i++) {
      if (!albums[i].size) continue;
      albumsId[albums[i].id] = albums[i];
      stickersPhotos[albums[i].id] = { stickers: [] };
      if (photosId[albums[i].thumb_id]) {
        stickersAlbums.push([albums[i].id, 1, photosId[albums[i].thumb_id].photo_75]);
      }
    }

    for (i = 0; i < photos.length; i++) {
      photosId[photos[i].id] = photos[i];
      stickersPhotos[photos[i].album_id].stickers.push([photos[i].id, 256, photos[i].photo_75]);
    }

    event.target.dispatchMessage('vkCustomStickers', {
      photos: stickersPhotos,
      albums: stickersAlbums,
      opts: opts
    });
  });
});