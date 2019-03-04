import 'jquery.event.gevent';
import { clearPeopleDb, makePerson } from './people';
import { stateMap, isFakeData } from './spa.model';
import fake from '../spa.fake';
import data from '../spa.data';

// The chat object API
// -------------------
// The chat object is available at spa.model.chat.
// The chat object provides methods and events to manage
// chat messaging. Its public methods include:
//  * join() - joins the chat room. This routine sets up
//    the chat protocol with the backend including publishers
//    for 'spa-listchange' and 'spa-updatechat' global
//    custom events. If the current user is anonymous,
//    join() aborts and returns false.
// ...
//
// jQuery global custom events published by the object include:
// ...
//  * spa-listchange - This is published when the list of
//    online people changes in length (i.e. when a person
//    joins or leaves a chat) or when their contents change
//    (i.e. when a person's avatar details change).
//    A subscriber to this event should get the people_db
//    from the people model for the updated data.
// ...
//

// Begin internal methods
const _updateList = (argList) => {
   const peopleList = argList[0];

   clearPeopleDb();

   for (let i = 0; i < peopleList.length; i++) {
      const personMap = peopleList[i];

      if (!personMap.name) {
         break;
      }

      // if user defined, update cssMap and skip remainder
      if (stateMap.user && stateMap.user.id === personMap._id) {
         stateMap.user.cssMap = personMap.cssMap;
         break;
      }

      const makePersonMap = {
         cid: personMap._id,
         cssMap: personMap.cssMap,
         id: personMap._id,
         name: personMap.name,
      };

      makePerson(makePersonMap);
   }

   stateMap.peopleDb.sort('name');
};

const _publishListchange = (argList) => {
   _updateList(argList);
   $.gevent.publish('spa-listchange', [argList]);
};
// End internal methods

const _leaveChat = () => {
   const sio = isFakeData ? fake.mockSio() : data.getSio();
   stateMap.isConnected = false;
   if (sio) {
      sio.emit('leavechat');
   }
};

const joinChat = () => {
   if (stateMap.isConnected) {
      return false;
   }

   if (stateMap.user.getIsAnon()) {
      console.warn('User must be defined before joining chat');

      return false;
   }

   const sio = isFakeData ? fake.mockSio() : data.getSio();
   sio.on('listchange', _publishListchange);
   stateMap.isConnected = true;

   return true;
};

export default {
   _leave: _leaveChat,
   join: joinChat,
};
