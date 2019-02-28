const configMap = {
   regexEncodeHtml: /[&"'><]/g,
   regexEncodeNoamp: /["'><]/g,
   htmlEncodeMap: {
      '&': '&#38;',
      '"': '&#34;',
      "'": '&#39;',
      '>': '&#62;',
      '<': '&#60;',
   },
};

configMap.encodeNoampMap = $.extend({}, configMap.htmlEncodeMap);
delete configMap.encodeNoampMap['&'];

// ------------------- BEGIN UTILITY METHODS ------------------
// Begin decodeHtml
// Decodes HTML entities in a browser-friendly way
// See http://stackoverflow.com/questions/1912501/\
//   unescape-html-entities-in-javascript
//
export const decodeHtml = str =>
   $('<div/>')
      .html(str || '')
      .text();
// End decodeHtml

// Begin encodeHtml
// This is single pass encoder for html entities and handles
// an arbitrary number of characters
//
export const encodeHtml = (inputArgStr, excludeAmp) => {
   const inputStr = String(inputArgStr);
   let regex;
   let lookupMap;

   if (excludeAmp) {
      lookupMap = configMap.encodeNoampMap;
      regex = configMap.regexEncodeNoamp;
   }
   else {
      lookupMap = configMap.htmlEncodeMap;
      regex = configMap.regexEncodeHtml;
   }

   return inputStr.replace(regex, match => lookupMap[match] || '');
};
// End encodeHtml

// Begin getEmSize
// returns size of ems in pixels
//
export const getEmSize = elem => Number(getComputedStyle(elem, '').fontSize.match(/\d*.?\d*/)[0]);
// End getEmSize
