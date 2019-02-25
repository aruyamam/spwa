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

// Begin public method /setSliderPosition/
// Example   : spa.chat.setSliderPosition( 'closed' );
// Purpose   : Move the chat slider to the requested position
// Arguments :
//   * position_type - enum('closed', 'opened', or 'hidden')
//   * callback - optional callback to be run end at the end
//     of slider animation.  The callback receives a jQuery
//     collection representing the slider div as its single
//     argument
// Action    :
//   This method moves the slider into the requested position.
//   If the requested position is the current position, it
//   returns true without taking further action
// Returns   :
//   * true  - The requested position was achieved
//   * false - The requested position was not achieved
// Throws    : none
//

// End public DOM method /setSliderPosition/
// ---------------------- END DOM METHODS ---------------------

// ------------------- BEGIN PUBLIC METHODS -------------------
// Example   : spa.chat.configModule({ slider_open_em : 18 });
// Purpose   : Configure the module prior to initialization
// Arguments :
//   * set_chat_anchor - a callback to modify the URI anchor to
//     indicate opened or closed state. This callback must return
//     false if the requested state cannot be met
//   * chat_model - the chat model object provides methods
//       to interact with our instant messaging
//   * people_model - the people model object which provides
//       methods to manage the list of people the model maintains
//   * slider_* settings. All these are optional scalars.
//       See mapConfig.settable_map for a full list
//       Example: slider_open_em is the open height in em's
// Action    :
//   The internal configuration data structure (configMap) is
//   updated with provided arguments. No other actions are taken.
// Returns   : true
// Throws    : JavaScript error object and stack trace on
//             unacceptable or missing arguments
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
// Example    : spa.chat.initModule( $('#div_id') );
// Purpose    :
//   Directs Chat to offer its capability to the user
// Arguments  :
//   * $append_target (example: $('#div_id')).
//     A jQuery collection that should represent
//     a single DOM container
// Action     :
//   Appends the chat slider to the provided container and fills
//   it with HTML content.  It then initializes elements,
//   events, and handlers to provide the user with a chat-room
//   interface
// Returns    : true on success, false on failure
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
