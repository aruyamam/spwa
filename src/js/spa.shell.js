import 'jquery.urianchor';
import 'jquery.event.ue';
import chat from './spa.chat';
import model from './spa.model';

const configMap = {
   anchorSchemaMap: {
      chat: {
         opened: true,
         closed: true,
      },
   },
   resizeInterval: 200,
   mainHtml: `
      <div class="spa-shell-head">
         <div class="spa-shell-head__logo">
            <h1>SPA</h1>
            <p>javascript end to end</p>
         </div>
         <div class="spa-shell-head__acct"></div>
      </div>
      <div class="spa-shell-main">
         <div class="spa-shell-main__nav"></div>
         <div class="spa-shell-main__content"></div>
      </div>
      <div class="spa-shell-foot"></div>
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
   $container: undefined,
   anchorMap: {},
   resizeIdto: undefined,
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

   $.extend(jqueryMap, {
      $container,
      $acct: $container.find('.spa-shell-head__acct'),
      $nav: $container.find('.spa-shell-main__nav'),
   });
};
// End DOM method /setJqueryMap/

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
const onHashchange = () => {
   const anchorMapPrevious = copyAnchorMap();
   let anchorMapProposed;
   let isOK = true;

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
         case 'opened':
            isOK = chat.setSliderPosition('opened');
            break;

         case 'closed':
            isOK = chat.setSliderPosition('closed');
            break;

         default:
            chat.setSliderPosition('closed');
            delete anchorMapProposed.chat;
            $.uriAnchor.setAnchor(anchorMapProposed, null, true);
            break;
      }
   }
   // End adjust chat component if changed

   // Begin revert anchor if slider change denied
   if (!isOK) {
      if (anchorMapPrevious) {
         $.uriAnchor.setAnchor(anchorMapPrevious, null, true);
         stateMap.anchorMap = anchorMapPrevious;
      }
      else {
         delete anchorMapProposed.chat;
         $.uriAnchor.setAnchor(anchorMapProposed, null, true);
      }
   }

   return false;
};
// End Event handler /onHashchange/

// Begin Event handler /onResize/
const onResize = () => {
   if (stateMap.resizeIdto) {
      return true;
   }

   chat.handleResize();
   stateMap.resizeIdto = setTimeout(() => {
      stateMap.resizeIdto = undefined;
   }, configMap.resizeInterval);

   return true;
};
// End Event handler /onResize/

const onTapAcct = () => {
   const user = model.people.getUser();
   if (user.getIsAnon()) {
      const userName = prompt('Please sign-in');
      model.people.login(userName);
      jqueryMap.$acct.text('... processing ...');
   }
   else {
      model.people.logout();
   }

   return false;
};

const onLogin = (event, loginUser) => {
   jqueryMap.$acct.text(loginUser.name);
};

const onLogout = (event, logoutUser) => {
   jqueryMap.$acct.text('Please sign-in');
};
// ---------------------- END EVENT HANDLER ----------------

// ---------------------- BEGIN CALLBACKS ---------------------
// Begin callback method /setChatAnchor/
// Example  : setChatAnchor( 'closed' );
// Purpose  : Change the chat component of the anchor
// Arguments:
//   * position_type - may be 'closed' or 'opened'
// Action   :
//   Changes the URI anchor parameter 'chat' to the requested
//   value if possible.
// Returns  :
//   * true  - requested anchor part was updated
//   * false - requested anchor part was not updated
// Throws   : none
//
const setChatAnchor = positionType => changeAnchorPart({ chat: positionType });
// End callback method /setChatAnchor/
// ----------------------- END CALLBACKS ----------------------

// ---------------------- BEGIN PUBLIC METHODS ----------------
// Begin Public method /initModule/
// Example  : spa.shell.initModule( $('#app_div_id') );
// Purpose  :
//   Directs the Shell to offer its capability to the user
// Arguments :
//   * $container (example: $('#app_div_id')).
//     A jQuery collection that should represent
//     a single DOM container
// Action    :
//   Populates $container with the shell of the UI
//   and then configures and initializes feature modules.
//   The Shell is also responsible for browser-wide issues
//   such as URI anchor and cookie management.
// Returns   : none
// Throws    : none
//
const initModule = ($container) => {
   stateMap.$container = $container;
   $container.html(configMap.mainHtml);
   setJqueryMap();

   // configure uriAnchor to user our schema
   $.uriAnchor.configModule({
      schema_map: configMap.anchorSchemaMap,
   });

   // configure and initialize feature moudles
   chat.configModule({
      setChatAnchor,
      // chatModel: model.chat,
      peopleModel: model.people,
   });
   chat.initModule(jqueryMap.$container);

   // Handle URI anchor change events.
   // This is done /after/ all feature moudles are configured
   // and initialized, otherwise they will not be ready to handle
   // the trigger event, which is used to ensure the anchor
   // is condiered on load
   //
   $(window)
      .bind('resize', onResize)
      .bind('hashchange', onHashchange)
      .trigger('hashchange');

   $.gevent.subscribe($container, 'spa-login', onLogin);
   $.gevent.subscribe($container, 'spa-logout', onLogout);

   jqueryMap.$acct.text('Please sign-in').bind('utap', onTapAcct);
};
// End Public method /setJqueryMap/
// ---------------------- END PUBLIC METHODS ----------------

export default { initModule };
