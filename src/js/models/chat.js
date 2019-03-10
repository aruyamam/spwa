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
//  * get_chatee() - return the person object with whom the user
//    is chatting with. If there is no chatee, null is returned.
//  * set_chatee( <person_id> ) - set the chatee to the person
//    identified by person_id. If the person_id does not exist
//    in the people list, the chatee is set to null. If the
//    person requested is already the chatee, it returns false.
//    It publishes a 'spa-setchatee' global custom event.
//  * send_msg( <msg_text> ) - send a message to the chatee.
//    It publishes a 'spa-updatechat' global custom event.
//    If the user is anonymous or the chatee is null, it
//    aborts and returns false.
//    joins or leaves a chat) or when their contents change
//    'spa-listchange' event which publishes the updated
//    people list and avatar information (the css_map in the
//    person objects). The update_avtr_map must have the form
//    { person_id : person_id, css_map : css_map }.
//
// jQuery global custom events published by the object include:
//  * spa-setchatee - This is published when a new chatee is
//    set. A map of the form:
//      { old_chatee : <old_chatee_person_object>,
//        new_chatee : <new_chatee_person_object>
//      }
//    is provided as data.
//  * spa-listchange - This is published when the list of
//    online people changes in length (i.e. when a person
//    joins or leaves a chat) or when their contents change
//    (i.e. when a person's avatar details change).
//    A subscriber to this event should get the people_db
//    from the people model for the updated data.
//  * spa-updatechat - This is published when a new message
//    is received or sent. A map of the form:
//      { dest_id   : <chatee_id>,
//        dest_name : <chatee_name>,
//        sender_id : <sender_id>,
//        msg_text  : <message_content>
//      }
//    is provided as data.
//
let chatee = null;

const setChatee = (personId) => {
   let newChatee = stateMap.peopleCidMap[personId];
   if (newChatee) {
      if (chatee && chatee.id === newChatee.id) {
         return false;
      }
   }
   else {
      newChatee = null;
   }

   $.gevent.publish('spa-setchatee', {
      oldChatee: chatee,
      newChatee,
   });
   chatee = newChatee;

   return true;
};

// Begin internal methods
const _updateList = (argList) => {
   const peopleList = argList[0];
   let isChateeOnline = false;

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
      const person = makePerson(makePersonMap);

      if (chatee && chatee.id === makePersonMap.id) {
         isChateeOnline = true;
         chatee = person;
      }
   }

   stateMap.peopleDb.sort('name');

   // If chatee is no longer online, we unset the chatee
   // which triggers the 'spa-setchatee' global event
   if (chatee && !isChateeOnline) {
      setChatee('');
   }
};

const _publishListchange = (argList) => {
   _updateList(argList);
   $.gevent.publish('spa-listchange', [argList]);
};

const _publishUpdatechat = (argList) => {
   const msgMap = argList[0];

   if (!chatee) {
      setChatee(msgMap.senderId);
   }
   else if (msgMap.senderId !== stateMap.user.id && msgMap.senderId !== chatee.id) {
      setChatee(msgMap.senderId);
   }

   $.gevent.publish('spa-updatechat', [msgMap]);
};
// End internal methods

const _leaveChat = () => {
   const sio = isFakeData ? fake.mockSio : data.getSio();
   chatee = null;
   stateMap.isConnected = false;
   if (sio) {
      sio.emit('leavechat');
   }
};

const getChatee = () => chatee;

const joinChat = () => {
   if (stateMap.isConnected) {
      return false;
   }

   if (stateMap.user.getIsAnon()) {
      console.warn('User must be defined before joining chat');

      return false;
   }

   const sio = isFakeData ? fake.mockSio : data.getSio();
   sio.on('listchange', _publishListchange);
   sio.on('updatechat', _publishUpdatechat);
   stateMap.isConnected = true;

   return true;
};

const sendMsg = (msgText) => {
   const sio = isFakeData ? fake.mockSio : data.getSio();

   if (!sio) {
      return false;
   }
   if (!(stateMap.user && chatee)) {
      return false;
   }

   const msgMap = {
      destId: chatee.id,
      destName: chatee.name,
      senderId: stateMap.user.id,
      msgText,
   };

   // we published updatechat so we can show our outgoing messages
   _publishUpdatechat([msgMap]);
   sio.emit('updatechat', msgMap);

   return true;
};

// avatar_update_map should have the form:
// { person_id : <string>, css_map : {
//   top : <int>, left : <int>,
//   'background-color' : <string>
// }};
//
const updateAvatar = (avatarUpdateMap) => {
   const sio = isFakeData ? fake.mockSio : data.getSio();
   if (sio) {
      sio.emit('updateavatar', avatarUpdateMap);
   }
};

export default {
   _leave: _leaveChat,
   getChatee,
   join: joinChat,
   sendMsg,
   setChatee,
   updateAvatar,
};
