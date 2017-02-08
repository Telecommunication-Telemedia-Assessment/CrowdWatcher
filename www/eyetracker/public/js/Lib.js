"use strict";

// --------------------------------------------------------------
// XML Logging
class XMLLogger {
  constructor() {
    this._content = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?>\n";
    this._tagStack = [];
  }

  _indent() {
      this._content += "\t".repeat(this._tagStack.length);
  }

  getContent() {
      if (this._tagStack.length)
        console.warn("Warning - XMLLogger content is incomplete!");

      return this._content;
  }

  // Create opening tag
  openTag(tagName, attrs) {
      if (!tagName)
          throw new Error("Error while opening Tag - tagName is required");

      var tag = "<" + tagName;
      if (attrs) {
          var keys = Object.keys(attrs);
          for (var i = 0; i < keys.length; i++) {
              var key = keys[i];
              tag += " " + key + "=\"" + attrs[key] + "\"";
          }
      }
      tag += ">\n";

      this._indent();
      this._content += tag;
      this._tagStack.push(tagName);
  }

  // Create closing tag
  closeTag(tagName) {
      if (this._tagStack.length == 0 ||
          this._tagStack.indexOf(tagName) !== this._tagStack.length - 1)
          throw new Error("Error while closing Tag - '" + tagName + "' is not the last opened tag");

      this._tagStack.pop();
      this._indent();
      this._content += "</" + tagName + "> \n";
  }

  // Create opening and closing tag at the same time
  createTag(tagName, attrs, content) {
      this.openTag(tagName, attrs);

      if (content) {
          this._indent();
          this._content += content + "\n";
      }

      this.closeTag(tagName);
  }
}

// -----------------------------------------------------------------
// Controller
class Controller extends EventEmitter {
  constructor() {
    super();
  }

  start() {}
  render() {return "";}
}

window.trace = function(text) {
  console.log((performance.now() / 1000).toFixed(3) + ": " + text);
}

// various helper functions
window.parseQuery = function(query) {
    var params = {};
    if (!query)
      return params;

    var Pairs = query.split(/[;&]/);
    for (var i = 0; i < Pairs.length; i++) {
        var keyval = Pairs[i].split('=');
        if (!keyval || keyval.length != 2)
          continue;
        var key = unescape(keyval[0]);
        var val = unescape(keyval[1]);
        val = val.replace(/\+/g, ' ');
        params[key] = val;
    }
    return params;
}

window.bindAll = function(obj) {
  var i, length = arguments.length, key;
  if (length <= 1) throw new Error('bindAll must be passed function names');
  for (i = 1; i < length; i++) {
    key = arguments[i];
    obj[key] = obj[key].bind(obj);
  }
  return obj;
};

// -----------------------------------------------------------------
// xhr wrapper
window.ajax = function(url, options) {
  var request = new XMLHttpRequest();
  request.onreadystatechange = function () {
    if (request.readyState == 4 && request.status == 200) {
      if (options.success);
        options.success(request.responseText);
    }
  };

  if (options.mimeType)
    request.overrideMimeType(options.mimeType);

  request.onerror = function (error) {
    if (options.error)
      options.error(error);
    else
      console.error(arguments);
  }

  if (options.progress)
    request.upload.addEventListener("progress", options.progress);

  if (options.complete)
    request.upload.addEventListener("load", options.complete);

  request.open(options.type || 'GET', url);
  request.send(options.data);
}

/* add boxes to index frames, see RecordRTC */
window.__DRAW_RED_BOX_ = false;
window.__DRAW_RED_BOX_INDEX__ = 0;
window.__DRAW_INDEX_BOX__ = function(ctx) {
  if (!__DRAW_RED_BOX_)
    return;

  var colors = ["red", "green", "blue", "yellow", "brown", "HotPink", "Orange", "Purple", "Salmon"];
  var lastFillStyle = ctx.fillStyle;
  ctx.fillStyle = colors[__DRAW_RED_BOX_INDEX__];
  ctx.fillRect(0, 0, 16, 16);
  ctx.fillStyle = lastFillStyle;

  if (++__DRAW_RED_BOX_INDEX__ > 8)
    __DRAW_RED_BOX__ = false;
}
