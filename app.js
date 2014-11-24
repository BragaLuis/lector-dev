window.require(['js/polyfills',
                'js/book',
                'js/bookviewer',
                'js/filepicker',
                'js/menu',
                'js/sizewatcher',
                'js/urlutils'],
  function(_, Book, BookViewer, FilePicker, Menu, SizeWatcher, UrlUtils) {
"use strict";

var $ = id => document.getElementById(id);
var windowWatcher = new SizeWatcher(window);
var bookViewer = new BookViewer($("contents"));

//
// Make sure that we do not rotate if executed on a phone/tablet,
// as this kills our layout.
//
["lockOrientation", "mozLockOrientation"].forEach(key => {
  if (key in window.screen) {
    window.screen[key]("portrait-primary");
  }
});

$("arrow_left").addEventListener("click", function() {
  bookViewer.changePageBy(-1);
});

$("arrow_right").addEventListener("click", function() {
  bookViewer.changePageBy(1);
});

bookViewer.notifications.addObserver("page:changing", function(event) {
  console.log("Moved to page", event);
  $("menu_bottom").textContent = "Page " + (event.page + 1) + "/" + (event.lastPage + 1) + " in document";
});
bookViewer.notifications.addObserver("chapter:exit", function(event) {
  Menus.bottom.showText("(Loading)");
});
bookViewer.notifications.addObserver("chapter:titleavailable", function(event) {
  Menus.top.showText(event.chapter.title);
});
bookViewer.notifications.addObserver("chapter:enter", function(event) {
  Menus.top.showText(event.chapter.title);
});
bookViewer.notifications.addObserver("book:open", function(event) {
  console.log("Opened book", event);
  $("welcome").classList.add("scrolledleft");
  Menus.top.showText(event.book.title);
});
bookViewer.notifications.addObserver("book:opening", function(event) {
  $("contents").classList.remove("invisible");
});
bookViewer.notifications.addObserver("book:opening:failed", function(event) {
  $("contents").classList.add("invisible");
  Menus.bottom.showText("Could not open book");
});
if ("mozSetMessageHandler" in navigator) {
  navigator.mozSetMessageHandler('activity', function(request) {
    console.log("Activity request", request);
    console.log("Activity data", JSON.stringify(request.source.data));
    console.log("App", "Opening file from activity", request.source.name);
    var file = request.source.data.blob;
    var promise = bookViewer.open(file, 0);
    promise = promise.then(null, e => {
      Menus.bottom.showText("Error while opening book: " + e);
      console.error(e);
    });
  });
}


var Menus = {
  top: new Menu($("menu_top")),
  bottom: new Menu($("menu_bottom")),
  show: function() {
    this.top.show();
    this.bottom.show();
  },
  hide: function() {
    this.top.hide();
    this.bottom.hide();
  },
  autoHide: function() {
    this.top.autoHide();
    this.bottom.autoHide();
  }
}

window.addEventListener("click", function(event) {
  console.log("Click");
  Menus.show();
});
Menus.autoHide();

//
// Welcome page
//
var filePicker = new FilePicker($("pick"), "application/*");
filePicker.notifications.addObserver("file:open", event => {
  console.log("App", "Opening file from the file picker", event.file);
  var file = event.file;
  var promise = bookViewer.open(file, 0);
  promise = promise.then(null, e => {
    Menus.bottom.showText("Error while opening book: " + e);
    console.error(e);
  });
});

//
// Load a book passed as URL.
//
var params = new URL(window.location).searchParams;
console.log("Params", params, new URL(window.location));
if (params) {
  try {
    if (params.get("action") == "view") {

    } else {
      var bookURL;
      var chapterNum = 0;
      var endOfChapter = false;
      if (params.has("book")) {
        bookURL = UrlUtils.toURL(params.get("book"));
      }

      if (params.has("chapter")) {
        chapterNum = Number.parseInt(params.get("chapter"));
      }
      if (params.has("end")) {
        endOfChapter = true;
      }

      if (bookURL) {
        bookViewer.open(bookURL, chapterNum, endOfChapter).then(null, e => {
          Menus.bottom.showText("Error while opening book: " + e);
          console.error(e);
        });
      }
    }
  } catch (ex) {
    console.error(ex);
  }
}

});
