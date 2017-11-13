/* eslint-env jest */
'use strict'
import TuftsAdapter from '../src/adapter.js'
import * as Models from 'alpheios-data-models'

describe('TuftsAdapter object', () => {
  beforeAll(() => {
  })

  test('get correct engine for language', () => {
    let adapter = new TuftsAdapter({ engine: { grc: 'morpheusgrc', lat: 'whitakerLat' }, url: null })
    let data = adapter.getEngineLanguageMap('grc')
    expect(data.engine).toEqual('morpheusgrc')
  })

  test('default values are returned', () => {
    let adapter = new TuftsAdapter({ engine: { grc: 'morpheusgrc' }, url: null })
    let retrieved = adapter.getEngineLanguageMap('grc')[Models.Feature.types.grmCase].get('nominative')
    let def = new Models.Feature('nominative', Models.Feature.types.grmCase, 'grc')
    expect(retrieved).toEqual(def)
  })

  test('mapped values are returned', () => {
    let adapter = new TuftsAdapter({ engine: { grc: 'morpheusgrc' }, url: null })
    let retrieved = adapter.getEngineLanguageMap('grc')[Models.Feature.types.gender].get('masculine feminine')
    let def = [ new Models.Feature(Models.Constants.GEND_MASCULINE, Models.Feature.types.gender, 'grc'),
      new Models.Feature(Models.Constants.GEND_FEMININE, Models.Feature.types.gender, 'grc')
    ]
    expect(retrieved).toEqual(def)
  })

  test('unmapped values with no defaults throws an error', () => {
    let adapter = new TuftsAdapter({ engine: { grc: 'morpheusgrc' }, url: null })
    expect(() => {
      let retrieved = adapter.getEngineLanguageMap('grc')[Models.Feature.types.person].get('1') // eslint-disable-line no-unused-vars
    }).toThrowError(/unknown value/)
  })

  test('we adapted mare properly', () => {
    let adapter = new TuftsAdapter({ engine: { grc: 'morpheusgrc', lat: 'whitakerLat' }, url: null })
    let mare = require('../src/lib/engine/data/latin_noun_adj_mare.json')
    let homonym = adapter.transform(mare)
    console.log(Array.isArray(homonym.lexemes))
    expect(homonym.lexemes.length).toEqual(3)
    let nounMare = homonym.lexemes.filter(l => l.lemma.word === 'mare')
    expect(nounMare.length).toEqual(1)
    let nounMarum = homonym.lexemes.filter(l => l.lemma.word === 'marum')
    expect(nounMarum.length).toEqual(1)
    let adjMas = homonym.lexemes.filter(l => l.lemma.word === 'mas')
    expect(adjMas.length).toEqual(1)
    expect(nounMare[0].inflections.length).toEqual(4)
    let nounMareVoc = nounMare[0].inflections.filter(i => i[Models.Feature.types.grmCase].includes('vocative'))
    expect(nounMareVoc.length).toEqual(1)
  })
})
