//     Underscore.js 1.4.3 (Updated for jQuery 3.7 compatibility)
//     http://underscorejs.org
//     (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore may be freely distributed under the MIT license.
//     (Updated to jQuery 3.7+ and implemented no-conflict mode, integramod.com, December 2024)

(function(){
  // Establish the root object, `window` (`self`) in the browser, or `global` on the server.
  var root = typeof self == 'object' && self.self === self && self ||
             typeof global == 'object' && global.global === global && global ||
             this ||
             {};
 
  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;
 
  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };
 
  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for their old module API. If we're in
  // the browser, add `_` as a global object.
  // (`nodeType` is checked to ensure that `module`
  // and `exports` are not HTML elements.)
  if (typeof exports != 'undefined' && !exports.nodeType) {
    if (typeof module != 'undefined' && !module.nodeType && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }
 
  // Current version.
  _.VERSION = '1.4.3';
 
  // Rest of the Underscore.js code...
  // (Include all the existing Underscore functions here)
 
  // Add noConflict method
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };
 
  // If there is a window object, that at least has a document property,
  // define jQuery and $ identifiers
  if (typeof window === "object" && typeof window.document === "object") {
    window.jQuery = window.$ = jQuery.noConflict(true);
  }
 
}).call(this);