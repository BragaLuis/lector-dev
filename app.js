window.require(['js/polyfills',
                'js/book',
                'js/bookviewer',
                'js/sizewatcher',
                'js/urlutils'],
  function(_, Book, BookViewer, SizeWatcher, UrlUtils) {
"use strict";

var $ = id => document.getElementById(id);
var windowWatcher = new SizeWatcher(window);
var bookViewer = new BookViewer($("contents"));

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
  console.log("Leaving chapter", event);
  $("menu_top").textContent = "(Loading document " + event.num + ")";
  showMenus();
});
bookViewer.notifications.addObserver("chapter:titleavailable", function(event) {
  console.log("Loading chapter", event);
  $("menu_top").textContent = event.chapter.title + " (Loading)";
  showMenus();
});
bookViewer.notifications.addObserver("chapter:enter", function(event) {
  console.log("Loading chapter", event);
  $("menu_top").textContent = event.chapter.title;
  showMenus();
});

if ("mozSetMessageHandler" in navigator) {
  navigator.mozSetMessageHandler('activity', function(request) {
    console.log("Activity request", request);
  });
}

function hideMenus() {
  if (!hideMenusTimeout) {
    window.clearTimeout(hideMenusTimeout);
  }
  hideMenusTimeout = window.setTimeout(function() {
    $("menu_top").classList.add("hidden");
    $("menu_bottom").classList.add("hidden");
    hideMenusTimeout = null;
  }, 3000);
}
var hideMenusTimeout = null;

function showMenus() {
  $("menu_top").classList.remove("hidden");
  $("menu_bottom").classList.remove("hidden");
  hideMenus();
}

window.addEventListener("click", function(event) {
  console.log("Click");
  showMenus();
});
hideMenus();

//
// Load a book passed as URL.
//
var bookURL = UrlUtils.toURL("samples/lector.epub");
var chapterNum = 0;
var params = new URL(window.location).searchParams;
console.log("Params", params, new URL(window.location));
if (params) {
  try {
    if (params.has("book")) {
      bookURL = UrlUtils.toURL(params.get("book"));
    }

    if (params.has("chapter")) {
      chapterNum = Number.parseInt(params.get("chapter"));
    }
  } catch (ex) {
    console.error(ex);
  }

  bookViewer.open(bookURL).then(
    bookViewer.navigateTo(chapterNum)
  ).then(null, e => console.error(e));
}

/**
 * The file picker.
 */

/*
var filePicker = new Observable(["open"]);
filePicker.eltControl = document.getElementById("pick_file_control");
filePicker.eltTab = document.getElementById("pick_file");
filePicker.init = function() {
  this.eltTab.addEventListener("click", e => {
    this.eltControl.click();
  });
  this.eltControl.addEventListener("click", e => {
    e.stopPropagation();
  });
  this.eltControl.addEventListener("change", e => {
    var files = this.eltControl.files;
    if (!files || files.length == 0) {
      // No files opened, nothing to do.
      return;
    }
    this.notify("open", {files: files});
  });
};
filePicker.init();
filePicker.addObserver("open", e => {
  var files = e.files;

  var book = new Book(files[0]);
  window.DEBUG_book = book;

  book.init().then(() => {
    console.log("Book is initialized", book.title, book.author);
    console.log("Chapters", book.chapters);
  });
});
*/

});
