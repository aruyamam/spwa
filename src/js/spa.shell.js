import 'jquery.urianchor';

const configMap = {
   anchorSchemaMap: {
      chat: {
         open: true,
         closed: true,
      },
   },
   mainHtml: `
      <div class="spa-shell-head">
         <div class="spa-shell-head-logo"></div>
         <div class="spa-shell-head-acct"></div>
         <div class="spa-shell-head-search"></div>
      </div>
      <div class="spa-shell-main">
         <div class="spa-shell-main-nav"></div>
         <div class="spa-shell-main-content"></div>
      </div>
      <div class="spa-shell-foot"></div>
      <div class="spa-shell-chat"></div>
      <div class="spa-shell-modal"></div>
   `,
   chatExtendTime: 1000,
   chatRetractTime: 300,
   chatExtendHeight: 450,
   chatRetreactHeight: 15,
   chatExtendedTitle: 'Click to retract',
   chatRetractedTitle: 'Click to extend',
};
const stateMap = {
   $container: null,
   anchorMap: {},
   isChatRetracted: true,
};
const jqueryMap = {};

// ---------------------- BEGIN UTITLITY METHODS ----------------
// Returns copy of stored anchor map; minimizes overhead
const copyAnchorMap = () => $.extend(true, {}, stateMap.anchorMap);
// ---------------------- END UTITLITY METHODS ----------------

// ---------------------- BEGIN DOM METHODS ----------------
// Begin DOM method /setJqueryMap/
const setJqueryMap = () => {
   const { $container } = stateMap;

   jqueryMap.$container = $container;
   jqueryMap.$chat = $container.find('.spa-shell-chat');
};
// End DOM method /setJqueryMap/

// Begin DOM method /toggleChat/
// Purpose : Extend or retracts chat slider
// Arguments :
//  * doExtend - if true, extends slider; if false retracts
//  * callback - optional function to execute at end of animation
// Settings
//  * chatExtendTime, chatRetractTime
//  * chatExtendHeight, chatRetractHeight
// Returns : boolean
//  * true - slider animation activated
//  * false - slider animation not activated
// State : sets stateMap.isChatRetracted
//  * true - slider is retracted
//  * false - slider is extended
//
const toggleChat = (doExtend, callback) => {
   const pxChatHt = jqueryMap.$chat.height();
   const isOpen = pxChatHt === configMap.chatExtendHeight;
   const isClosed = pxChatHt === configMap.chatRetreactHeight;
   const isSliding = !isOpen && !isClosed;

   // avoid race condition
   if (isSliding) {
      return false;
   }

   // Begin extend chat slider
   if (doExtend) {
      jqueryMap.$chat.animate(
         {
            height: configMap.chatExtendHeight,
         },
         configMap.chatExtendTime,
         () => {
            jqueryMap.$chat.attr('title', configMap.chatExtendedTitle);
            stateMap.isChatRetracted = false;
            if (callback) {
               callback(jqueryMap.$chat);
            }
         },
      );

      return true;
   }
   // End extend chat slider

   // Begin retract chat slider
   jqueryMap.$chat.animate(
      {
         height: configMap.chatRetreactHeight,
      },
      configMap.chatRetractTime,
      () => {
         jqueryMap.$chat.attr('title', configMap.chatRetractedTitle);
         stateMap.isChatRetracted = true;
         if (callback) {
            callback(jqueryMap.$chat);
         }
      },
   );

   return true;
   // End retract chat slider
};
// End DOM method /toggleChat/

// Begin DOM method /changeAnchorPart/
// Purpose : Change part of the URI anchor component
// Arguments :
//  * argMap - The map describing what part of the URI anchor we want changed.
// Returns : boolean
//  * true - the Anchor portion of the URI was update
//  * false - the Anchor portion of the URI could not be updated
// Action :
//  The current anchor rep stored in stateMap.anchorMap.
//  See uriAnchor for a discussion of encoding.
//  This method
//  * Creates a copy of this map using copyAnchorMap().
//  * Modifies the key-values using argMap.
//  * Manages the distinction between independent
//    and dependent values in the encoding.
//  * Attempts to change the URI using uriAnchor.
//  * Returns true on success, and false on failure.
//
const changeAnchorPart = (argMap) => {
   const anchorMapRevise = copyAnchorMap();
   let boolReturn = true;
   let keyNameDep;

   // Begin merge changes into anchor map
   for (const keyName in argMap) {
      if (argMap.hasOwnProperty(keyName)) {
         // skip dependent keys during iteration
         if (keyName.indexOf('_') === 0) {
            continue;
         }

         // update independent key value
         anchorMapRevise[keyName] = argMap[keyName];

         // update matching dependent key
         keyNameDep = `_${keyName}`;
         if (argMap[keyNameDep]) {
            anchorMapRevise[keyNameDep] = argMap[keyNameDep];
         }
         else {
            delete anchorMapRevise[keyNameDep];
            delete anchorMapRevise[`_s${keyNameDep}`];
         }
      }
   }
   // End merge changes into anchor map

   // Begin attempt to update URI: revert if not successful
   try {
      $.uriAnchor.setAnchor(anchorMapRevise);
   }
   catch (error) {
      // replace URI with existing state
      $.uriAnchor.setAnchor(stateMap.anchorMap, null, true);
      boolReturn = false;
   }
   // End attempt to update URI...

   return boolReturn;
};
// End DOM method /changeAnchorPart/
// ---------------------- END DOM METHODS ----------------

// ---------------------- BEGIN EVENT HANDLER S----------------
// Begin Event handler /onHashchange/
// Purpose : Handles the hashchange  event
// Arguments :
//  * event - jQuery event object.
// Settings : none
// Returns : false
// Action :
//  * Parses the URI anchor component
//  * Compares proposed application state with current
//  * Adjust the application only where proposed state differs from exisinting
//
const onHashchange = (event) => {
   const anchorMapPrevious = copyAnchorMap();
   let anchorMapProposed;

   // attempt to parse anchor
   try {
      anchorMapProposed = $.uriAnchor.makeAnchorMap();
   }
   catch (error) {
      $.uriAnchor.setAnchor(anchorMapPrevious, null, true);

      return false;
   }
   stateMap.anchorMap = anchorMapProposed;

   // convenience vars
   const _sChatPrevious = anchorMapPrevious._s_chat;
   const _sChatProposed = anchorMapProposed._s_chat;

   // Begin adjust chat component if changed
   if (!anchorMapPrevious || _sChatPrevious !== _sChatProposed) {
      const sChatProposed = anchorMapProposed.chat;
      switch (sChatProposed) {
         case 'open':
            toggleChat(true);
            break;

         case 'closed':
            toggleChat(false);
            break;

         default:
            toggleChat(false);
            delete anchorMapProposed.chat;
            $.uriAnchor.setAnchor(anchorMapProposed, null, true);
            break;
      }
   }
   // End adjust chat component if changed

   return false;
};
// End Event handler /onHashchange/

// Begin Event handler /onClickChat/
const onClickChat = () => {
   changeAnchorPart({
      chat: stateMap.isChatRetracted ? 'open' : 'closed',
   });

   return false;
};
// End Event handler /onClickChat/
// ---------------------- END EVENT HANDLER ----------------

// ---------------------- BEGIN PUBLIC METHODS ----------------
// Begin Public method /setJqueryMap/
const initModule = ($container) => {
   stateMap.$container = $container;
   $container.html(configMap.mainHtml);
   setJqueryMap();

   // initialize chat slider and bine click handler
   stateMap.isChatRetracted = true;
   jqueryMap.$chat.attr('title', configMap.chatRetractedTitle).click(onClickChat);

   // configure uriAnchor to user our schema
   $.uriAnchor.configModule({
      schema_map: configMap.anchorSchemaMap,
   });

   // Handle URI anchor change events.
   // This is done /after/ all feature moudles are configured
   // and initialized, otherwise they will not be ready to handle
   // the trigger event, which is used to ensure the anchor
   // is condiered on load
   //
   $(window)
      .bind('hashchange', onHashchange)
      .trigger('hashchange');
};
// End Public method /setJqueryMap/
// ---------------------- END PUBLIC METHODS ----------------

export default { initModule };
