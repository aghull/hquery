var hQuery = require('../hQuery.js')
, setup = require('./game.setup');

describe("hquery", function() {

  var hq;

  beforeEach(function() {
    hq = new hQuery(setup.board);
  });

  it("finds", function() {
    hq.aliases.adjectives = { my: 'player:1' };
    hq.aliases.elements = {
      card: {
        name: ['AS', '2S', '4S', '3H', '6D', 'wheat', 'brick']
      }
    };
    expect(hq.find('first:3 card')).toEqual(['2S', '4S', '3H']);
    expect(hq.find('last card')).toEqual('brick');
    expect(hq.find('nth:3 card')).toEqual('3H');
    expect(hq.find('card in my hand')).toEqual(['2S', '4S', '3H', '6D']);
    expect(hq.find('wheat in last hand')).toEqual(['wheat', 'wheat', 'wheat']);
    expect(hq.find('suit of card in hand')).toEqual(['S', 'S', 'H', 'D', '', '', '', '', '', '', '', '']);
    expect(hq.find('player of the hand with 2S')).toEqual(1);
    expect(hq.find('suit:S card in my hand', {player:1})).toEqual(['2S', '4S']);
    expect(hq.find('not suit:S card in player:1 hand', {player:1})).toEqual(['3H', '6D']);
    expect(hq.find('value:2 suit:S card in player:1 hand', {player:1})).toEqual(['2S']);
    expect(hq.find('highest:value suit:S card in my hand')).toEqual('4S');
    expect(hq.find('highest:value suit:S card')).toEqual('AS');
    expect(hq.find('player of hand with highest:value suit:H card')).toEqual(1);
    expect(hq.find('the country with my army')).toEqual('kamchatka');
  });

  it ("aggregates", function() {
    expect(hq.find('quantity of card in player:1 hand')).toEqual(4);
    expect(hq.find('presence of suit:H card in player:1 hand')).toEqual(true);
    expect(hq.find('absence of suit:C card in player:1 hand')).toEqual(true);
    expect(hq.find('sum:value of card in player:1 hand')).toEqual(15);
  });

  it ("takes aliases", function() {
    hq.aliases.adjectives = { my: 'player:1' };
    hq.aliases.elements = {
      card: {
        name: ['wheat']
      }
    };
    expect(hq.find('first card in my hand')).toEqual('2S');
    expect(hq.find('quantity of wheat in last hand')).toEqual(3);
  });

  it ("throws errors", function() {
    expect(function() { hq.find('asdf card'); }).toThrow('"asdf" is not a valid adjective in "asdf card"');
  });
});
