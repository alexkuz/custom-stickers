// ==UserScript==
// @name MessagingDemo
// @include http://vk.com/*
// @include https://vk.com/*
// ==/UserScript==

kango.addMessageListener('vkCustomStickers', function(event) {
  var customStickers = event.data;
  injectScript('window.VKINJECT_customStickers = ' + JSON.stringify(customStickers));
}, false);

function injectScript(text) {
  var c = document.createElement('script');
  c.innerHTML = text;
  document.body.appendChild(c);
}

kango.xhr.send({method:'GET', url:'res/inject.js', async:true}, function(res) {
  if (res.status === 0 || res.status == 200) {
    injectScript(res.response);
 }  
});
