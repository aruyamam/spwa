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
   chatExtendTime: 1000,
   chatRetractTime: 300,
   chatExtendHeight: 450,
   chatRetreactHeight: 15,
   chatExtendedTitle: 'Click to retract',
   chatRetractedTitle: 'Click to extend',
};
const stateMap = {
   $container: null,
   isChatRetracted: true,
};
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
// ---------------------- END DOM METHODS ----------------

// ---------------------- BEGIN EVENT HANDLER ----------------
const onClickChat = () => {
   toggleChat(stateMap.isChatRetracted);

   return false;
};
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
};
// End Public method /setJqueryMap/
// ---------------------- END PUBLIC METHODS ----------------

export default { initModule };
