let fakeIdSerial = 5;

const makeFakeId = () => `id_${String(fakeIdSerial++)}`;

const getPeopleList = () => [
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

const mockSio = () => {
   const callbackMap = {};

   const onSio = (msgType, callback) => {
      callbackMap[msgType] = callback;
   };

   const emitSio = (msgType, data) => {
      // respond to 'adduser' event with 'userupdate'
      // callback after a 3s delay
      //
      if (msgType === 'adduser' && callbackMap.userupdate) {
         setTimeout(() => {
            callbackMap.userupdate([
               {
                  _id: makeFakeId(),
                  name: data.name,
                  cssMap: data.cssMap,
               },
            ]);
         }, 3000);
      }
   };

   return { emit: emitSio, on: onSio };
};

export default { getPeopleList, mockSio };
