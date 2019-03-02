import 'jquery.event.gevent';
import fake from './spa.fake';
import data from './spa.data';

const TAFFY = require('taffydb').taffy;

/*
 * spa.model.js
 * Model module
 */

const configMap = { anonId: 'a0' };
const stateMap = {
   anonUser: null,
   cidSerial: 0,
   peopleCidMap: {},
   peopleDb: TAFFY(),
   user: null,
};

const isFakeData = true;

// The people object API
// ---------------------
// The people object is available at spa.model.people.
// The people object provides methods and events to manage
// a collection of person objects. Its public methods include:
//   * get_user() - return the current user person object.
//     If the current user is not signed-in, an anonymous person
//     object is returned.
//   * get_db() - return the TaffyDB database of all the person
//     objects - including the current user - presorted.
//   * get_by_cid( <client_id> ) - return a person object with
//     provided unique id.
//   * login( <user_name> ) - login as the user with the provided
//     user name. The current user object is changed to reflect
//     the new identity. Successful completion of login
//     publishes a 'spa-login' global custom event.
//   * logout()- revert the current user object to anonymous.
//     This method publishes a 'spa-logout' global custom event.
//
// jQuery global custom events published by the object include:
//   * spa-login - This is published when a user login process
//     completes. The updated user object is provided as data.
//   * spa-logout - This is published when a logout completes.
//     The former user object is provided as data.
//
// Each person is represented by a person object.
// Person objects provide the following methods:
//   * get_is_user() - return true if object is the current user
//   * get_is_anon() - return true if object is anonymous
//
// The attributes for a person object include:
//   * cid - string client id. This is always defined, and
//     is only different from the id attribute
//     if the client data is not synced with the backend.
//   * id - the unique id. This may be undefined if the
//     object is not synced with the backend.
//   * name - the string name of the user.
//   * css_map - a map of attributes used for avatar
//     presentation.
//
const personProto = {
   getIsUser() {
      return this.cid === stateMap.anonUser.cid;
   },
   getIsAnon() {
      return this.cid === stateMap.anonUser.cid;
   },
};

const makeCid = () => `c${String(stateMap.cidSerial++)}`;

const clearPeopleDb = () => {
   const { user } = stateMap;
   stateMap.peopleDb = TAFFY();
   stateMap.peopleCidMap = {};
   if (user) {
      stateMap.peopleDb.insert(user);
      stateMap.peopleCidMap[user.cid] = user;
   }
};

const completeLogin = (userList) => {
   const userMap = userList[0];
   delete stateMap.peopleCidMap[userMap.cid];
   stateMap.user.cid = userMap._id;
   stateMap.user.id = userMap._id;
   stateMap.user.cssMap = userMap.cssMap;
   stateMap.peopleCidMap[userMap._id] = stateMap.user;

   // When we add chat, we should join here
   $.gevent.publish('spa-login', [stateMap.user]);
};

const makePerson = (personMap) => {
   const {
      cid, cssMap, id, name,
   } = personMap;

   if (cid === undefined || !name) {
      throw 'client id and name required';
   }

   const person = Object.create(personProto);
   person.cid = cid;
   person.name = name;
   person.cssMap = cssMap;

   if (id) {
      person.id = id;
   }

   stateMap.peopleCidMap[cid] = person;

   stateMap.peopleDb.insert(person);

   return person;
};

const removePerson = (person) => {
   if (!person) {
      return false;
   }
   // cannot remove anonymous person
   if (person.id === configMap.anonId) {
      return false;
   }

   stateMap.peopleDb({ cid: person.cid }).remove();
   if (person.cid) {
      delete stateMap.peopleCidMap[person.cid];
   }

   return true;
};

const people = {
   getByCid(cid) {
      return stateMap.peopleCidMap[cid];
   },

   getDB() {
      return stateMap.peopleDb;
   },

   getUser() {
      return stateMap.user;
   },

   getCidMap() {
      return stateMap.peopleCidMap;
   },

   login(name) {
      const sio = isFakeData ? fake.mockSio() : data.getSio();

      stateMap.user = makePerson({
         cid: makeCid(),
         cssMap: { top: 25, left: 25, 'background-color': '#8f8' },
         name,
      });

      sio.on('userupdate', completeLogin);

      sio.emit('adduser', {
         cid: stateMap.user.cid,
         cssMap: stateMap.user.cssMap,
         name: stateMap.user.name,
      });
   },

   logout() {
      const { user } = stateMap;
      // when we add chat, we should leave the chatroom here

      const isRemoved = removePerson(user);
      stateMap.user = stateMap.anonUser;

      $.gevent.publish('spa-logout', [user]);

      return isRemoved;
   },
};

const initModule = () => {
   // initialize anonymous person
   stateMap.anonUser = makePerson({
      cid: configMap.anonId,
      id: configMap.anonId,
      name: 'anonymous',
   });
   stateMap.user = stateMap.anonUser;

   if (isFakeData) {
      const peopleList = fake.getPeopleList();
      for (let i = 0; i < peopleList.length; i++) {
         const personMap = peopleList[i];
         makePerson({
            cid: personMap._id,
            cssMap: personMap.cssMap,
            id: personMap._id,
            name: personMap.name,
         });
      }
   }
};

export default {
   initModule,
   people,
};
