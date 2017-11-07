/* eslint-env jest */
'use strict'
import TuftsAdapter from '../src/adapter.js'
import * as Models from 'alpheios-data-models'

describe('TuftsAdapter object', () => {
  let adapter, mare

  beforeAll(() => {
    adapter = new TuftsAdapter({})
    mare = require('../src/lib/lang/data/latin_noun_adj_mare.json')
  })

  test('we adapted mare properly', () => {
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
