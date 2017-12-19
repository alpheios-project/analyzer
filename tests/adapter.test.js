/* eslint-env jest */
'use strict'
import TuftsAdapter from '../src/adapter.js'
import * as Models from 'alpheios-data-models'

describe('TuftsAdapter object', () => {
  beforeAll(() => {
  })

  test('default config', () => {
    let adapter = new TuftsAdapter()
    expect(adapter.config).toBeTruthy()
    expect(adapter.config.engine).toBeTruthy()
  })

  test('get correct engine for language', () => {
    let adapter = new TuftsAdapter()
    let data = adapter.getEngineLanguageMap('grc')
    expect(data.engine).toEqual('morpheusgrc')
  })

  test('get persian engine', () => {
    let adapter = new TuftsAdapter()
    let data = adapter.getEngineLanguageMap('per')
    expect(data.engine).toEqual('hazm')
  })

  test('default values are returned', () => {
    let adapter = new TuftsAdapter()
    let retrieved = adapter.getEngineLanguageMap('grc')[Models.Feature.types.grmCase].get('nominative')
    let def = new Models.Feature('nominative', Models.Feature.types.grmCase, 'grc')
    expect(retrieved).toEqual(def)
  })

  test('mapped values are returned', () => {
    let adapter = new TuftsAdapter()
    let retrieved = adapter.getEngineLanguageMap('grc')[Models.Feature.types.gender].get('masculine feminine')
    let def = [ new Models.Feature(Models.Constants.GEND_MASCULINE, Models.Feature.types.gender, 'grc'),
      new Models.Feature(Models.Constants.GEND_FEMININE, Models.Feature.types.gender, 'grc')
    ]
    expect(retrieved).toEqual(def)
  })

  test('unmapped values with no defaults throws an error', () => {
    let adapter = new TuftsAdapter()
    expect(() => {
      let retrieved = adapter.getEngineLanguageMap('grc')[Models.Feature.types.person].get('1') // eslint-disable-line no-unused-vars
    }).toThrowError(/unknown value/)
  })

  test('we adapted mare properly', () => {
    let adapter = new TuftsAdapter()
    let mare = require('../src/lib/engine/data/latin_noun_adj_mare.json')
    let homonym = adapter.transform(mare)
    expect(homonym.lexemes.length).toEqual(3)
    let nounMare = homonym.lexemes.filter(l => l.lemma.word === 'mare')
    expect(nounMare.length).toEqual(1)
    expect(nounMare[0].meaning).toBeTruthy()
    expect(nounMare[0].lemma.features.declension[0].value).toEqual('3rd')
    expect(nounMare[0].lemma.features['part of speech'][0].value).toEqual('noun')
    expect(nounMare[0].provider.uri).toEqual('urn:TuftsMorphologyService:mare:morpheuslat')
    let nounMarum = homonym.lexemes.filter(l => l.lemma.word === 'marum')
    expect(nounMarum.length).toEqual(1)
    let adjMas = homonym.lexemes.filter(l => l.lemma.word === 'mas')
    expect(adjMas.length).toEqual(1)
    expect(nounMare[0].inflections.length).toEqual(4)
    let nounMareVoc = nounMare[0].inflections.filter(i => i[Models.Feature.types.grmCase].includes('vocative'))
    expect(nounMareVoc.length).toEqual(1)
  })

  test('we adapted cupidinibus properly', () => {
    let adapter = new TuftsAdapter()
    let data = require('../src/lib/engine/data/latin_noun_cupidinibus.json')
    let homonym = adapter.transform(data)
    expect(homonym.lexemes.length).toEqual(2)
    let word = homonym.lexemes.filter(l => l.lemma.word === 'cupido')
    expect(word.length).toEqual(1)
    console.log(word[0].lemma.features.frequency)
    expect(word[0].lemma.features.frequency[0].value).toEqual('frequent')
    expect(word[0].lemma.features.frequency[0].sortOrder).toEqual(5)
    expect(word[0].lemma.features.source[0].value).toEqual('Ox.Lat.Dict.')
  })
})
