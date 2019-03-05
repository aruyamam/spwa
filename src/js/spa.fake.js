import model from './models/spa.model';

let fakeIdSerial = 5;

const makeFakeId = () => `id_${String(fakeIdSerial++)}`;

const peopleList = [
   {
      name: 'Betty',
      _id: 'id_01',
      cssMap: {
         top: 20,
         left: 20,
         'background-color': 'rgb(128, 128, 128)',
      },
   },
   {
      name: 'Mike',
      _id: 'id_02',
      cssMap: {
         top: 60,
         left: 20,
         'background-color': 'rgb(128, 255, 128)',
      },
   },
   {
      name: 'Pebbles',
      _id: 'id_03',
      cssMap: {
         top: 100,
         left: 20,
         'background-color': 'rgb(128, 192, 192)',
      },
   },
   {
      name: 'Wilma',
      _id: 'id_04',
      cssMap: {
         top: 140,
         left: 20,
         'background-color': 'rgb(192, 128, 128)',
      },
   },
];

const mockSio = (function mockSio() {
   let listchangeIdto;
   const callbackMap = {};

   const onSio = (msgType, callback) => {
      callbackMap[msgType] = callback;
   };

   const emitSio = (msgType, data) => {
      // respond to 'adduser' event with 'userupdate'
      // callback after a 3s delay
      if (msgType === 'adduser' && callbackMap.userupdate) {
         setTimeout(() => {
            const personMap = {
               _id: makeFakeId(),
               name: data.name,
               cssMap: data.cssMap,
            };
            peopleList.push(personMap);
            callbackMap.userupdate([personMap]);
         }, 3000);
      }

      // respond to 'updatechat' event with 'updatechat'
      // callback after a 2s delay. Echo back user info.
      if (msgType === 'updatechat' && callbackMap.updatechat) {
         setTimeout(() => {
            const user = model.people.getUser();
            callbackMap.updatechat([
               {
                  destId: user.id,
                  destName: user.name,
                  senderId: data.destId,
                  msgText: `Thanks for the note, ${user.name}`,
               },
            ]);
         }, 2000);
      }

      if (msgType === 'leavechat') {
         // reset login status
         delete callbackMap.listchange;
         delete callbackMap.updatechat;

         if (listchangeIdto) {
            clearTimeout(listchangeIdto);
            listchangeIdto = undefined;
         }
         sendListchange();
      }
   };

   const emitMockMsg = () => {
      setTimeout(() => {
         const user = model.people.getUser();
         if (callbackMap.updatechat) {
            callbackMap.updatechat([
               {
                  destId: user.id,
                  destName: user.name,
                  senderId: 'id_04',
                  msgText: `Hi there ${user.name}! Wilma here.`,
               },
            ]);
         }
         else {
            emitMockMsg();
         }
      }, 8000);
   };

   // Try once per second to use listchange callback.
   // Stop trying after first success.
   const sendListchange = () => {
      listchangeIdto = setTimeout(() => {
         if (callbackMap.listchange) {
            callbackMap.listchange([peopleList]);
            emitMockMsg();
            listchangeIdto = undefined;
         }
         else {
            sendListchange();
         }
      }, 1000);
   };

   // We have to start the process ...
   sendListchange();

   return { emit: emitSio, on: onSio };
}());

export default { mockSio };
