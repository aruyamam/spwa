/*
 * spa.util.js
 * General JavaScript utilities
 *
 * Michael S. Mikowski - mmikowski at gmail dot com
 * These are routines I have created, compiled, and updated
 * since 1998, with inspiration from around the web.
 *
 * MIT License
 *
 */

export const makeError = (nameText, msgText, data) => {
   const error = new Error();
   error.name = nameText;
   error.message = msgText;

   if (data) {
      error.data = data;
   }

   return error;
};
// End Public constructor /makeError/

// Begin Public method /setConfigMap/
// Purpose: Common code to set configs in feature modules
// Arguments:
//   * input_map    - map of key-values to set in config
//   * settable_map - map of allowable keys to set
//   * config_map   - map to apply settings to
// Returns: true
// Throws : Exception if input key not allowed
//

export const setConfigMap = (argMap) => {
   const { inputMap } = argMap;
   const { settableMap } = argMap;
   const { configMap } = argMap;

   for (const keyName in inputMap) {
      if (inputMap.hasOwnProperty(keyName)) {
         if (settableMap.hasOwnProperty(keyName)) {
            configMap[keyName] = inputMap[keyName];
         }
         else {
            const error = makeError(
               'Bad Input',
               `Setting config key |${keyName}| is not supported`,
            );
            throw error;
         }
      }
   }
};
// End Public method /setConfigMap/
