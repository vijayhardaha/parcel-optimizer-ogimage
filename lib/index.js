"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _plugin = require("@parcel/plugin");

var _url = _interopRequireDefault(require("url"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Package modules.

/*
 * Extract a meta from a given html string
 */
const findMeta = (html, propertyName, propertyValue) => {
  const regex = new RegExp(`<meta[^>]*${propertyName}=["|']${propertyValue}["|'][^>]*>`, 'i');
  const regexExec = regex.exec(html);

  if (regexExec) {
    return regexExec[0];
  }

  return false;
};
/*
 * Extract the content of a given meta html
 */


const getMetaTagContent = metaTagHtml => {
  const regex = /content=["]([^"]*)["]/i;
  const regexExec = regex.exec(metaTagHtml);

  if (regexExec) {
    return regexExec[1];
  }

  return false;
};
/*
 * Change the url of a meta by prepending the given baseUrl
 */


const patchMetaToAbsolute = (metaHTML, baseUrl) => {
  const metaContent = getMetaTagContent(metaHTML);
  return metaHTML.replace(metaContent, _url.default.resolve(baseUrl, metaContent) // Relative url to absolute url
  );
};
/**
 * Helper functions to loop for multiple replace.
 */


const replaceUrls = (contents, urlProperty, imageProperty) => {
  const urlTag = findMeta(contents, 'property', urlProperty);

  if (!urlTag) {
    return contents;
  }

  const metaUrl = getMetaTagContent(urlTag); // Fetch original meta

  const imageMeta = findMeta(contents, 'property', imageProperty);

  if (imageMeta) {
    return contents.replace(imageMeta, patchMetaToAbsolute(imageMeta, metaUrl));
  }

  return contents;
}; // Exports.


var _default = new _plugin.Optimizer({
  async optimize({
    contents,
    map,
    options
  }) {
    if (options.hot) {
      return {
        contents,
        map
      };
    }

    let replacedContents = contents;
    replacedContents = replaceUrls(replacedContents, 'og:url', 'og:image');
    replacedContents = replaceUrls(replacedContents, 'twitter:url', 'twitter:image');
    return {
      contents: replacedContents,
      map
    };
  }

});

exports.default = _default;