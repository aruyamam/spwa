const configMap = {
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
   chatExtendtime: 1000,
   chatRetractTime: 300,
   chatExtendHeight: 450,
   chatRetreactHeight: 15,
};
const stateMap = { $container: null };
const jqueryMap = {};

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
         () => {
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
      () => {
         if (callback) {
            callback(jqueryMap.$chat);
         }
      },
   );

   return true;
   // End retract chat slider
};

// ---------------------- END DOM METHODS ----------------

// ---------------------- BEGIN PUBLIC METHODS ----------------
// Begin Public method /setJqueryMap/
const initModule = ($container) => {
   stateMap.$container = $container;
   $container.html(configMap.mainHtml);
   setJqueryMap();

   // test toggle
   setTimeout(() => toggleChat(true), 3000);
   setTimeout(() => toggleChat(false), 8000);
};
// End Public method /setJqueryMap/
// ---------------------- END PUBLIC METHODS ----------------

export default { initModule };
