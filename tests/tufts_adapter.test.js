"use strict";
import TuftsAdapter from '../src/tufts/adapter.js';
import * as Models from 'alpheios-data-models';

describe('TuftsAdapter object', () => {

    let adapter, mare;

    beforeAll(() => {
      adapter  = new TuftsAdapter();
      mare = require('./data/latin_noun_adj_mare.json');

    });

    test('we adapted mare properly', () => {
      let homonym = adapter.transform(mare);
      console.log(Array.isArray(homonym.lexemes));
      expect(homonym.lexemes.length).toEqual(3);
      let noun_mare = homonym.lexemes.filter(l => l.lemma.word === 'mare');
      expect(noun_mare.length).toEqual(1);
      let noun_marum = homonym.lexemes.filter(l => l.lemma.word === 'marum');
      expect(noun_marum.length).toEqual(1);
      let adj_mas = homonym.lexemes.filter(l => l.lemma.word === 'mas');
      expect(adj_mas.length).toEqual(1);
      expect(noun_mare[0].inflections.length).toEqual(4);
      let noun_mare_voc = noun_mare[0].inflections.filter(i => i[Models.Feature.types.grmCase].includes('vocative'));
      expect(noun_mare_voc.length).toEqual(1);
    });

});
