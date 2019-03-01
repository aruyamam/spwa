import getPeopleList from './spa.fake';

const TAFFY = require('taffydb').taffy;

/*
 * spa.model.js
 * Model module
 */

const configMap = { anonId: 'a0' };
const stateMap = {
   anonUser: null,
   peopleCidMap: {},
   peopleDB: TAFFY(),
};
const isFakeData = true;

const personProto = {
   getIsUser() {
      return this.cid === stateMap.anonUser.cid;
   },
   getIsAnon() {
      return this.cid === stateMap.anonUser.cid;
   },
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

   stateMap.peopleDB.insert(person);

   return person;
};

const people = {
   getDB() {
      return stateMap.peopleDB;
   },
   getCidMap() {
      return stateMap.peopleCidMap;
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
      const peopleList = getPeopleList();
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

window.model = {
   initModule,
   people,
};

export default {
   initModule,
   people,
};
