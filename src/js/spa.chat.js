/*
 * spa.chat.js
 * Chat feature module for SPA
 */
import { setConfigMap } from './spa.util';

const configMap = {
   mainHtml: `
      <div class="spa-chat">
         <div class="spa-chat-head">
            <div class="spa-chat-head__toggle"></div>
            <div class="spa-chat-head__title">
               Chat
            </div>
         </div>
         <div class="spa-chat-closer">x</div>
         <div class="spa-chat-sizer">
            <div class="spa-chat-msgs"></div>
            <div class="spa-chat-box">
               <input type="text"/>
               <div>send</div>
            </div>
         </div>
      </div>
   `,

   settableMap: {
      sliderOpenTime: true,
      sliderCloseTime: true,
      sliderOpenedEm: true,
      sliderClosedEm: true,
      sliderClosedTitle: true,
      sliderOpenedTitle: true,

      chatModel: true,
      peopleModel: true,
      setChatAnchor: true,
   },

   sliderOpenTime: 250,
   sliderCloseTime: 250,
   sliderOpenedEm: 16,
   sliderClosedEm: 2,
   sliderOpenedTitle: 'Click to close',
   sliderClosedTitle: 'Click to open',

   chatMoel: null,
   peopleModel: null,
   setChatAnchor: null,
};
const stateMap = {
   $appendTarget: null,
   positionType: 'closed',
   pxPerEm: 0,
   sliderHiddenPx: 0,
   sliderClosedPx: 0,
   sliderOpenedPx: 0,
};
let jqueryMap = {};

// ------------------- BEGIN UTILITY METHODS ------------------
const getEmSize = elem => Number(getComputedStyle(elem, '').fontSize.match(/\d*\.?\d*/)[0]);
// -------------------- END UTILITY METHODS -------------------

// --------------------- BEGIN DOM METHODS --------------------
// Begin DOM method /setJqueryMap/
const setJqueryMap = () => {
   const { $appendTarget } = stateMap;
   const $slider = $appendTarget.find('.spa-chat');

   jqueryMap = {
      $slider,
      $head: $slider.find('.spa-chat-head'),
      $toggle: $slider.find('.spa-chat-head__toggle'),
      $title: $slider.find('.spa-chat-head__title'),
      $sizer: $slider.find('.spa-chat-sizer'),
      $msgs: $slider.find('.spa-chat-msgs'),
      $box: $slider.find('.spa-chat-box'),
      $input: $slider.find('.spa-chat-input input[type=text]'),
   };
};
// End DOM method /setJqueryMap/

// Begin DOM method /setPxSizes/
const setPxSizes = () => {
   const pxPerEm = getEmSize(jqueryMap.$slider.get(0));

   const openedHeightEm = configMap.sliderOpenedEm;

   stateMap.pxPerEm = pxPerEm;
   stateMap.sliderClosedPx = configMap.sliderClosedEm * pxPerEm;
   stateMap.sliderOpenedPx = openedHeightEm * pxPerEm;
   jqueryMap.$sizer.css({
      height: (openedHeightEm - 2) * pxPerEm,
   });
};
// End DOM method /setPxSizes/

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
const setSliderPosition = (positionType, callback) => {
   let heightPx;
   let animateTime;
   let sliderTitle;
   let toggleText;

   // return true if slider already in requested position
   if (stateMap.positionType === positionType) {
      return true;
   }

   // prepare animate parameters
   switch (positionType) {
      case 'opened':
         heightPx = stateMap.sliderOpenedPx;
         animateTime = configMap.sliderOpenTime;
         sliderTitle = configMap.sliderOpenedTitle;
         toggleText = '=';
         break;

      case 'hidden':
         heightPx = 0;
         animateTime = configMap.sliderOpenTime;
         sliderTitle = '';
         toggleText = '+';
         break;

      case 'closed':
         heightPx = stateMap.sliderClosedPx;
         animateTime = configMap.sliderCloseTime;
         sliderTitle = configMap.sliderClosedTitle;
         toggleText = '+';
         break;

      // bail for unknown positionType
      default:
         return false;
   }

   // animate slider position change
   stateMap.positionType = '';
   jqueryMap.$slider.animate({ height: heightPx }, animateTime, () => {
      jqueryMap.$toggle.prop('title', sliderTitle);
      jqueryMap.$toggle.text(toggleText);
      stateMap.positionType = positionType;
      if (callback) {
         callback(jqueryMap.$slider);
      }
   });

   return true;
};
// End public DOM method /setSliderPosition/
// ---------------------- END DOM METHODS ---------------------

// ------------------- BEGIN EVENT HANDLERS -------------------
const onClickToggle = () => {
   const { setChatAnchor } = configMap;
   if (stateMap.positionType === 'opened') {
      setChatAnchor('closed');
   }
   else if (stateMap.positionType === 'closed') {
      setChatAnchor('opened');
   }

   return false;
};
// -------------------- END EVENT HANDLERS --------------------

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
const initModule = ($appendTarget) => {
   $appendTarget.append(configMap.mainHtml);
   stateMap.$appendTarget = $appendTarget;
   setJqueryMap();
   setPxSizes();

   // initialize chat slider to default title and state
   jqueryMap.$toggle.prop('title', configMap.sliderClosedTitle);
   jqueryMap.$head.click(onClickToggle);
   stateMap.positionType = 'closed';

   return true;
};
// End public method /initModule/

export default {
   configModule,
   initModule,
   setSliderPosition,
};
