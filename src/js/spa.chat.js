/*
 * spa.chat.js
 * Chat feature module for SPA
 */
import { setConfigMap } from './utils/spa.util';
import { encodeHtml, getEmSize } from './utils/spa.util_b';

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
            <div class="spa-chat-list">
               <div class="spa-chat-list__box"></div>
            </div>
            <div class="spa-chat-msg">
               <div class="spa-chat-msg__log"></div>
               <div class="spa-chat-msg__in">
                  <form class="spa-chat-msg__form">
                     <input type="text"/>
                     <input type="submit" style="display:none" />
                     <div class="spa-chat-msg__send">
                        send
                     </div>
                  </form>
               </div>
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
   sliderOpenedEm: 18,
   sliderClosedEm: 2,
   sliderOpenedTitle: 'Tap to close',
   sliderClosedTitle: 'Tap to open',
   sliderOpenedMinEm: 10,
   windowHeightMinEm: 20,

   chatModel: null,
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
      $listBox: $slider.find('.spa-chat-list__box'),
      $msgLog: $slider.find('.spa-chat-msg__log'),
      $msgIn: $slider.find('.spa-chat-msg__in'),
      $input: $slider.find('.spa-chat-msg__in input[type=text]'),
      $send: $slider.find('.spa-chat-msg__send'),
      $form: $slider.find('.spa-chat-msg__form'),
      $window: $(window),
   };
};
// End DOM method /setJqueryMap/

// Begin DOM method /setPxSizes/
const setPxSizes = () => {
   const pxPerEm = getEmSize(jqueryMap.$slider.get(0));
   const windowHeightEm = Math.floor(jqueryMap.$window.height() / pxPerEm + 0.5);

   const openedHeightEm = windowHeightEm > configMap.windowHeightMinEm
      ? configMap.sliderOpenedEm
      : configMap.sliderOpenedMinEm;

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

   // position type of 'opened' is not allowed for anon user
   // therefore we simply return flase; the shell will fix the
   // uri and try again.
   if (positionType === 'opened' && configMap.peopleModel.getUser().getIsAnon()) {
      return false;
   }

   // return true if slider already in requested position
   if (stateMap.positionType === positionType) {
      if (positionType === 'opened') {
         jqueryMap.$input.focus();
      }

      return true;
   }

   // prepare animate parameters
   switch (positionType) {
      case 'opened':
         heightPx = stateMap.sliderOpenedPx;
         animateTime = configMap.sliderOpenTime;
         sliderTitle = configMap.sliderOpenedTitle;
         toggleText = '=';
         jqueryMap.$input.focus();
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

// Begin private DOM methods to manage chat message
const scrollChat = () => {
   const { $msgLog } = jqueryMap;
   $msgLog.animate(
      {
         scrollTop: $msgLog.prop('scrollHieght') - $msgLog.height(),
      },
      150,
   );
};

const writeChat = (personName, text, isUser) => {
   const msgClass = isUser ? 'spa-chat-msg__log-me' : 'spa-chat-msg__log-msg';

   jqueryMap.$msgLog.append(`
      <div class="${msgClass}">
         ${encodeHtml(personName)}: ${encodeHtml(text)}
      </div>
   `);

   scrollChat();
};

const writeAlert = (alertText) => {
   jqueryMap.$msgLog.append(`
      <div class="spa-chat-msg__log-alert">
         ${encodeHtml(alertText)}
      </div>
   `);
   scrollChat();
};

const clearChat = () => jqueryMap.$msgLog.empty();
// End private DOM methods to manage chat message
// ---------------------- END DOM METHODS ---------------------

// ------------------- BEGIN EVENT HANDLERS -------------------
const onTapToggle = () => {
   const { setChatAnchor } = configMap;
   if (stateMap.positionType === 'opened') {
      setChatAnchor('closed');
   }
   else if (stateMap.positionType === 'closed') {
      setChatAnchor('opened');
   }

   return false;
};

const onSubmitMsg = (event) => {
   const msgText = jqueryMap.$input.val();
   if (msgText.trim() === '') {
      return false;
   }
   configMap.chatModel.sendMsg(msgText);
   jqueryMap.$input.focus();
   jqueryMap.$send.addClass('spa-x-select');
   setTimeout(() => {
      jqueryMap.$send.removeClass('spa-x-select');
   }, 250);

   return false;
};

const onTapList = (event) => {
   const $tapped = $(event.elem_target);
   if (!$tapped.hasClass('spa-chat-list__name')) {
      return false;
   }

   const chateeId = $tapped.attr('data-id');
   if (!chateeId) {
      return false;
   }

   configMap.chatModel.setChatee(chateeId);

   return false;
};

const onSetchatee = (event, argMap) => {
   const { newChatee, oldChatee } = argMap;

   jqueryMap.$input.focus();
   if (!newChatee) {
      if (oldChatee) {
         writeAlert(`${oldChatee.name} has left the chat`);
      }
      else {
         writeAlert('Your friend has left the chat');
      }
      jqueryMap.$title.text('Chat');

      return false;
   }

   jqueryMap.$listBox
      .find('.spa-chat-list__name')
      .removeClass('spa-x-select')
      .end()
      .find(`[data-id="${argMap.newChatee.id}"]`)
      .addClass('spa-x-select');

   writeAlert(`Now chatting with ${argMap.newChatee.name}`);
   jqueryMap.$title.text(`Chat with ${argMap.newChatee.name}`);

   return true;
};

const onListchange = (event) => {
   let listHtml = String();
   const peopleDb = configMap.peopleModel.getDB();
   const chatee = configMap.chatModel.getChatee();

   peopleDb().each((person, idx) => {
      let selectClass = '';

      if (person.getIsAnon() || person.getIsUser()) {
         return true;
      }

      if (chatee && chatee.id === person.id) {
         selectClass = 'spa-x-select';
      }

      listHtml += `
      <div class="spa-chat-list__name${selectClass}" data-id="${person.id}">
         ${encodeHtml(person.name)}
      </div>
     `;
   });

   if (!listHtml) {
      listHtml = `
         <div class="spa-chat-list__note">
            To chat alone is the fate of all great souls ...
            <br><br>
            No one is online
         </div>
      `;
      clearChat();
   }
   jqueryMap.$listBox.html(listHtml);
};

const onUpdatechat = (event, msgMap) => {
   const { senderId, msgText } = msgMap;
   const chatee = configMap.chatModel.getChatee() || {};
   const sender = configMap.peopleModel.getByCid(senderId);

   if (!sender) {
      writeAlert(msgText);

      return false;
   }

   const isUser = sender.getIsUser();

   if (!(isUser || senderId === chatee.id)) {
      configMap.chatModel.setChatee(senderId);
   }

   writeChat(sender.name, msgText, isUser);

   if (isUser) {
      jqueryMap.$input.val('');
      jqueryMap.$input.focus();
   }
};

const onLogin = (event, loginUser) => {
   configMap.setChatAnchor('opened');
};

const onLogout = (event, logoutUser) => {
   configMap.setChatAnchor('closed');
   jqueryMap.$title.text('Chat');
   clearChat();
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
   // load chat slider html and jquery cache
   stateMap.$appendTarget = $appendTarget;
   $appendTarget.append(configMap.mainHtml);
   setJqueryMap();
   setPxSizes();

   // initialize chat slider to default title and state
   jqueryMap.$toggle.prop('title', configMap.sliderClosedTitle);
   jqueryMap.$toggle.text('+');
   stateMap.positionType = 'closed';

   // Have $listBox subscribe to jQuery global events
   const { $listBox } = jqueryMap;
   $.gevent.subscribe($listBox, 'spa-listchange', onListchange);
   $.gevent.subscribe($listBox, 'spa-setchatee', onSetchatee);
   $.gevent.subscribe($listBox, 'spa-updatechat', onUpdatechat);
   $.gevent.subscribe($listBox, 'spa-login', onLogin);
   $.gevent.subscribe($listBox, 'spa-logout', onLogout);

   // bind user input events
   jqueryMap.$head.bind('utap', onTapToggle);
   jqueryMap.$listBox.bind('utap', onTapList);
   jqueryMap.$send.bind('utap', onSubmitMsg);
   jqueryMap.$form.bind('submit', onSubmitMsg);
};
// End public method /initModule/

// Begin public method /removeSlider/
// Purpose    :
//   * Removes chatSlider DOM element
//   * Reverts to initial state
//   * Removes pointers to callbacks and other data
// Arguments  : none
// Returns    : true
// Throws     : none
//
const removeSlider = () => {
   // unwind initializtion and state
   // remove DOM container; this removes event bindings too
   if (jqueryMap.$slider) {
      jqueryMap.$slider.remove();
      jqueryMap = {};
   }
   stateMap.$appendTarget = null;
   stateMap.positionType = 'closed';

   // unwind key configurations
   configMap.chatModel = null;
   configMap.peopleModel = null;
   configMap.setChatAnchor = null;

   return true;
};
// End public method /removeSlider/

// Begin public method /handleResize/
// Purpose    :
//   Given a window resize event, adjust the presentation
//   provided by this module if needed
// Actions    :
//   If the window height or width falls below
//   a given threshold, resize the chat slider for the
//   reduced window size.
// Returns    : Boolean
//   * false - resize not considered
//   * true  - resize considered
// Throws     : none
//
const handleResize = () => {
   // don't do anything if we don't have a slider container
   if (!jqueryMap.$slider) {
      return false;
   }

   setPxSizes();
   if (stateMap.positionType === 'opened') {
      jqueryMap.$slider.css({
         height: stateMap.sliderOpenedPx,
      });
   }

   return true;
};
// End public method /handleResize/

export default {
   configModule,
   handleResize,
   initModule,
   removeSlider,
   setSliderPosition,
};
