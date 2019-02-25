/*
 * spa.chat.js
 * Chat feature module for SPA
 */
import { setConfigMap } from './spa.util';

const configMap = {
   mainHtml: `
      <div style="padding:1em; color:#fff;">
         Say hello to chat
      </div>
   `,
   settableMap: {},
};
const stateMap = { $container: null };
const jqueryMap = {};

// --------------------- BEGIN DOM METHODS --------------------
// Begin DOM method /setJqueryMap/
const setJqueryMap = () => {
   const { $container } = stateMap;
   jqueryMap.$container = $container;
};
// End DOM method /setJqueryMap/
// ---------------------- END DOM METHODS ---------------------

// ------------------- BEGIN PUBLIC METHODS -------------------
// Begin public method /configModule/
// Purpose    : Adjust configuration of allowed keys
// Arguments  : A map of settable keys and values
//   * color_name - color to use
// Settings   :
//   * configMap.settable_map declares allowed keys
// Returns    : true
// Throws     : none
//
const configModule = (inputMap) => {
   setConfigMap({
      inputMap,
      settableMap: configMap.settableMap,
      configMap,
   });

   return true;
};
// End public method /configModule/

// Begin public method /initModule/
// Purpose    : Initializes module
// Arguments  :
//  * $container the jquery element used by this feature
// Returns    : true
// Throws     : none
//
const initModule = ($container) => {
   $container.html(configMap.mainHtml);
   stateMap.$container = $container;
   setJqueryMap();

   return true;
};
// End public method /initModule/

export default {
   configModule,
   initModule,
};
