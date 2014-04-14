stManager.add(['emoji.js'], function() {
  window.VKINJECT_customStickers = null;

  function num(n,cs) {
    if (!n) return cs[2];
    n = n % 100;
    if ((n % 10 === 0) || (n % 10 > 4) || (n > 4 && n < 21)) {
      return cs[2];
    } else
    if (n % 10 == 1) {
      return cs[0];
    } else {
      return cs[1];
    }
  }

  var reinjectKey = 'injected' + Math.random().toString(26).substr(2);
  function inject(orig, hook, type, noReinject) {
    if (noReinject && orig[reinjectKey]) {
      return orig;
    }
    var f = function() {
      var ret;
      if (typeof type == 'function' || type == 'before' || type == 'replace') {
        ret = hook.apply(this, arguments);
      }
      if (type == 'manual') {
        ret = hook.call(this, arguments, orig);
      } else
      if (type != 'replace') {
        ret = orig.apply(this, arguments);
      }
      if (typeof type == 'function') {
        ret = type.apply(this, [ret].concat(arguments));
      } else
      if (!type || type == 'after') {
        ret = hook.apply(this, [ret].concat(arguments));
      }
      return ret;
    };
    if (noReinject) {
      f[reinjectKey] = true;
    }
    return f;
  }

  Emoji.getTabsCode = inject(Emoji.getTabsCode, function(args, func) {
    var extra = [],
        customStickers = window.VKINJECT_customStickers;
    if (!customStickers) {
      return func.apply(this, args);
    }

    var albums = customStickers.albums;

    for (var i = 0; i < albums.length; i++) {
      if (customStickers.opts.albums.indexOf(customStickers.albums[i][0]) !== -1) {
        extra.push(customStickers.albums[i]);
      }
    }
    args[0] = (args[0] || []).concat(extra);

    var html = func.apply(this, args);

    html = html.replace(/src="\/images\/store\/stickers\/(\d+)\/[^"]*"/g,
      function(orig, albumId) {
        var src = null;
        albumId = parseInt(albumId);
        for (var i = 0; i < albums.length; i++) {
          if (albums[i][0] === albumId) {
            src = albums[i][2];
            break;
          }
        }
        return src ? 'src="' + src + '"' : orig;
      });
    return html;
  }, 'manual', true);

  Emoji.tabSwitch = inject(Emoji.tabSwitch, function(args, func) {
    var customStickers = window.VKINJECT_customStickers,
        selId = args[1];
    if (!Emoji.stickers || !customStickers || !customStickers.photos[selId]) {
      return func.apply(this, args);
    }
    var ss = customStickers.photos[selId].stickers;

    Emoji.stickers[selId] = customStickers.photos[selId];

    func.apply(this, args);

    var cont = geByClass1('emoji_scroll', Emoji.opts[args[2]].tt);
    if (cont) {
      cont.innerHTML = cont.innerHTML.replace(/src="\/images\/stickers\/(\d+)\/[^"]*"/g,
        function(_, photoId) {
          var src = '';
          photoId = parseInt(photoId);
          for (var i = 0; i < ss.length; i++) {
            if (ss[i][0] === photoId) {
              src = ss[i][2];
              break;
            }
          }
          return 'src="' + src + '"';
        });
    }
  }, 'manual', true);

  Emoji.stickerClick = inject(Emoji.stickerClick, function(args, func) {
    if (args[1] >= 1000000) {
      var oldMedias = cur.imPeerMedias[cur.peer];
      var oldText = val(ge('im_txt' + cur.peer));
      cur.imPeerMedias[cur.peer] = [['photo', '-69762228_' + args[1], 1, '<div></div>', undefined]];
      IM.send();
      cur.imPeerMedias[cur.peer] = oldMedias;
      Emoji.ttHide(args[0]);
    } else {
      return func.apply(this, args);
    }
  }, 'manual', true);
});