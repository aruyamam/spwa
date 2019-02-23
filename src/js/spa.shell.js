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
};
const stateMap = { $container: null };
const jqueryMap = {};

// ---------------------- BEGIN DOM METHODS ----------------
// Begin DOM method /setJqueryMap/
const setJqueryMap = () => {
   const { $container } = stateMap;
   jqueryMap.$container = $container;
};
// End DOM method /setJqueryMap/
// ---------------------- END DOM METHODS ----------------

// ---------------------- BEGIN PUBLIC METHODS ----------------
// Begin Public method /setJqueryMap/
const initModule = ($container) => {
   stateMap.$container = $container;
   $container.html(configMap.mainHtml);
   setJqueryMap();
};
// End Public method /setJqueryMap/
// ---------------------- END PUBLIC METHODS ----------------

export default { initModule };
