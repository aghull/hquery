var hQuery = require('../hQuery.js');

var board = '<game>' +
'<hand player="1" my="self">' +
'  <card name="2S" suit="S" value="2"/>' +
'  <card name="4S" suit="S" value="4"/>' +
'  <card name="3H" suit="H" value="3"/>' +
'  <card name="6D" suit="D" value="6"/>' +
'</hand>' +
'<hand player=2>' +
'  <card/>' +
'  <card/>' +
'  <card/>' +
'  <card/>' +
'</hand>' +
'<hand player=3 my="partner"/>' +
'  <card/>' +
'  <card/>' +
'  <card/>' +
'  <card/>' +
'</hand>' +
'<board>' +
'  <card facedown="true"/>' +
'  <card name="AS" suit="S" value="14"/>' +
'</board>' +
'' +
'<hand player=2>' +
'  <card name="wheat"/>' +
'  <card name="wheat"/>' +
'  <card name="wheat"/>' +
'  <card name="brick"/>' +
'</hand>' +
'' +
'<board>' +
'  <asia>' +
'    <kamchatka>' +
'      <army player="1"/>' +
'      <army player="1"/>' +
'      <army player="1"/>' +
'    </kamchatka>' +
'  </asia>' +
'</board>' +
'</game>';

var hq = new hQuery(board);
hq.aliases.elements = {
  card: {
    name: ['wheat']
  }
};

console.log(hq.find('wheat'));
console.log(hq.find('first:3 card'));
console.log(hq.find('last card'));
console.log(hq.find('card in player:1 hand'));
console.log(hq.find('name:wheat card in last hand'));
console.log(hq.find('suit of card in hand'));
console.log(hq.find('player of hand with the name:2S card'));
console.log(hq.find('suit:S card in my:self hand', {player:1}));
console.log(hq.find('not suit:S card in my:self hand', {player:1}));
console.log(hq.find('value:2 suit:S card in my:self hand', {player:1}));
console.log(hq.find('highest:value suit:S card in my:self hand'));
console.log(hq.find('highest:value suit:S card'));
console.log(hq.find('player of hand with highest:value suit:H card'));

console.log(hq.find('quantity of card in player:1 hand'));
console.log(hq.find('presence of suit:H card in player:1 hand'));
console.log(hq.find('absence of suit:D card in player:1 hand'));
console.log(hq.find('sum:value of card in player:1 hand'));
