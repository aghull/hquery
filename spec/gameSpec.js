var hQuery = require('../hQuery.js')
, setup = require('./game.setup');

describe("hquery", function() {

  var hq;

  beforeEach(function() {
    hq = new hQuery(setup.board);
  });

  it("works", function() {
    expect(hq.find('first:3 card')).toEqual(['2S', '4S', '3H']);
    expect(hq.find('last card')).toEqual('brick');
    expect(hq.find('card in player:1 hand')).toEqual(['2S', '4S', '3H', '6D']);
    expect(hq.find('name:wheat card in last hand')).toEqual(['wheat', 'wheat', 'wheat']);
    expect(hq.find('suit of card in hand')).toEqual(['S', 'S', 'H', 'D', '', '', '', '', '', '', '', '']);
    expect(hq.find('player of hand with the name:2S card')).toEqual(1);
    expect(hq.find('suit:S card in player:1 hand', {player:1})).toEqual(['2S', '4S']);
    expect(hq.find('not suit:S card in player:1 hand', {player:1})).toEqual(['3H', '6D']);
    expect(hq.find('value:2 suit:S card in player:1 hand', {player:1})).toEqual(['2S']);
    expect(hq.find('highest:value suit:S card in player:1 hand')).toEqual('4S');
    expect(hq.find('highest:value suit:S card')).toEqual('AS');
    expect(hq.find('player of hand with highest:value suit:H card')).toEqual(1);
  });

  it ("throws errors", function() {
    expect(function() { hq.find('asdf card'); }).toThrow('"asdf" is not a valid adjective in "asdf card"');
  });
});
