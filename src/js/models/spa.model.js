import 'jquery.event.gevent';
import people, { makePerson } from './people';
import chat from './chat';

const TAFFY = require('taffydb').taffy;

/*
 * spa.model.js
 * Model module
 */

export const configMap = { anonId: 'a0' };
export const stateMap = {
   anonUser: null,
   cidSerial: 0,
   isConnected: false,
   peopleCidMap: {},
   peopleDb: TAFFY(),
   user: null,
};

export const isFakeData = true;

const initModule = () => {
   // initialize anonymous person
   stateMap.anonUser = makePerson({
      cid: configMap.anonId,
      id: configMap.anonId,
      name: 'anonymous',
   });
   stateMap.user = stateMap.anonUser;
};

window.$ = $;
window.model = {
   initModule,
   chat,
   people,
};

export default {
   initModule,
   chat,
   people,
};
