/*
 * spa.avtr.js
 * Avatar feature module
 */
import { setConfigMap } from './utils/spa.util';
import { encodeHtml } from './utils/spa.util_b';

const configMap = {
   chatModel: null,
   peopleModel: null,

   settableMap: {
      chatModel: true,
      peopleModel: true,
   },
};

const stateMap = {
   dragMap: null,
   $dragTarget: null,
   dragBgColor: undefined,
};

const jqueryMap = {};

// ------------------- BEGIN UTILITY METHODS ------------------
const getRandRgb = () => {
   const rgbList = [];
   for (let i = 0; i < 3; i++) {
      rgbList.push(Math.floor(Math.random() * 128) + 128);
   }

   return `rgb(${rgbList.join(',')})`;
};
// -------------------- END UTILITY METHODS -------------------

// --------------------- BEGIN DOM METHODS --------------------
const setJqueryMap = ($container) => {
   jqueryMap.$container = $container;
};

const updateAvatar = ($target) => {
   const cssMap = {
      top: parseInt($target.css('top'), 10),
      left: parseInt($target.css('left'), 10),
      'background-color': $target.css('background-color'),
   };
   const personId = $target.attr('data-id');

   configMap.chatModel.updateAvatar({ personId, cssMap });
};
// ---------------------- END DOM METHODS ---------------------

// ------------------- BEGIN EVENT HANDLERS -------------------
const onTapNav = (event) => {
   const $target = $(event.elem_target).closest('.spa-avtr-box');

   if ($target.length === 0) {
      return false;
   }
   $target.css({ 'background-color': getRandRgb() });
   updateAvatar($target);
};

const onHeldstartNav = (event) => {
   const $target = $(event.elem_target).closest('.spa-avtr-box');

   if ($target.length === 0) {
      return false;
   }

   stateMap.$dragTarget = $target;
   const offsetTargetMap = $target.offset();
   const offsetNavMap = jqueryMap.$container.offset();

   offsetTargetMap.top -= offsetNavMap.top;
   offsetTargetMap.left -= offsetNavMap.left;

   stateMap.dragMap = offsetTargetMap;
   stateMap.dragBgColor = $target.css('background-color');

   $target.addClass('spa-x-is-drag').css('background-color', '');
};

const onHeldmoveNav = (event) => {
   const { dragMap } = stateMap;
   if (!dragMap) {
      return false;
   }

   dragMap.top += event.px_delta_y;
   dragMap.left += event.px_delta_x;

   stateMap.$dragTarget.css({
      top: dragMap.top,
      left: dragMap.left,
   });
};

const onHeldendNav = (event) => {
   const { $dragTarget } = stateMap;
   if (!$dragTarget) {
      return false;
   }

   $dragTarget.removeClass('spa-x-is-drag').css('background-color', stateMap.dragBgColor);

   stateMap.dragBgColor = undefined;
   stateMap.$dragTarget = null;
   stateMap.dragMap = null;
   updateAvatar($dragTarget);
};

const onSetchatee = (event, argMap) => {
   const $nav = $('.spa-shell-main__nav');
   const { newChatee, oldChatee } = argMap;

   // Use this to hidhlight avatar of user in nav area
   // See newChatee.name, oldChatee.name, etc.

   // remove hightlight from oldChatee avatar here
   if (oldChatee) {
      $nav.find(`.spa-avtr-box[data-id="${oldChatee.cid}"]`).removeClass('spa-x-is-chatee');
   }

   // add highlight to newChatee avatar here
   if (newChatee) {
      $nav.find(`.spa-avtr-box[data-id="${newChatee.cid}"]`).addClass('spa-x-is-chatee');
   }
};

const onListchange = (event) => {
   const $nav = $('.spa-shell-main__nav');
   const peopleDb = configMap.peopleModel.getDB();
   const user = configMap.peopleModel.getUser();
   const chatee = configMap.chatModel.getChatee() || {};

   $nav.empty();
   // if the user is logged out, do not render
   if (user.getIsAnon()) {
      return false;
   }

   peopleDb().each((person, idx) => {
      if (person.getIsAnon()) {
         return true;
      }
      const classList = ['spa-avtr-box'];

      if (person.id === chatee.id) {
         classList.push('spa-x-is-chatee');
      }
      if (person.getIsUser()) {
         classList.push('spa-x-is-user');
      }

      $('<div/>')
         .addClass(classList.join(' '))
         .css(person.cssMap)
         .attr('data-id', String(person.id))
         .prop('title', encodeHtml(person.name))
         .text(person.name)
         .appendTo($nav);
   });
};

const onLogout = () => jqueryMap.$container.empty();
// -------------------- END EVENT HANDLERS --------------------

// ------------------- BEGIN PUBLIC METHODS -------------------
// Begin public method /configModule/
// Example  : spa.avtr.configModule({...});
// Purpose  : Configure the module prior to initialization,
//   values we do not expect to change during a user session.
// Action   :
//   The internal configuration data structure (configMap)
//   is updated  with provided arguments. No other actions
//   are taken.
// Returns  : none
// Throws   : JavaScript error object and stack trace on
//            unacceptable or missing arguments
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
// Example    : spa.avtr.initModule( $container );
// Purpose    : Directs the module to begin offering its feature
// Arguments  : $container - container to use
// Action     : Provides avatar interface for chat users
// Returns    : none
// Throws     : none
//
const initModule = ($container) => {
   setJqueryMap($container);

   // bind model global events
   $.gevent.subscribe($container, 'spa-setchatee', onSetchatee);
   $.gevent.subscribe($container, 'spa-listchange', onListchange);
   $.gevent.subscribe($container, 'spa-logout', onLogout);

   // bind user input events
   $container
      .bind('utap', onTapNav)
      .bind('uheldstart', onHeldstartNav)
      .bind('uheldmove', onHeldmoveNav)
      .bind('uheldend', onHeldendNav);

   return true;
};
// End public method /initModule/

export default {
   configModule,
   initModule,
};
