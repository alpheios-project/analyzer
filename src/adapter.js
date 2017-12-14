import BaseAdapter from 'alpheios-morph-client'
import Whitakers from './lib/engine/whitakers'
import Morpheusgrc from './lib/engine/morpheusgrc'
import Aramorph from './lib/engine/aramorph'
import Hazm from './lib/engine/hazm'
import * as Models from 'alpheios-data-models'
import WordTestData from './lib/engine/data/test-data'
import DefaultConfig from './config.json'

class TuftsAdapter extends BaseAdapter {
  /**
   * A Morph Client Adapter for the Tufts Morphology Service
   * @constructor
   * @param {object} engine an object which maps language code to desired engine code
                            for that language. E.g. { lat : whitakerLat, grc: morpheusgrc }
   */
  constructor (config = null) {
    super()
    if (config == null) {
      try {
        this.config = JSON.parse(DefaultConfig)
      } catch (e) {
        this.config = DefaultConfig
      }
    } else {
      this.config = config
    }
    this.engineMap = new Map(([ Whitakers, Morpheusgrc, Aramorph, Hazm ]).map((e) => { return [ e.engine, e ] }))
  }

  getEngineLanguageMap (lang) {
    if (this.config.engine[lang]) {
      return this.engineMap.get(this.config.engine[lang][0])
    } else {
      return null
    }
  }

  prepareRequestUrl (lang, word) {
    let engine = this.getEngineLanguageMap(lang)
    if (engine) {
      let code = engine.engine
      return this.config.url.replace('r_WORD', word).replace('r_ENGINE', code).replace('r_LANG', lang)
    } else {
      return null
    }
  }

  fetchTestData (lang, word) {
    return new Promise((resolve, reject) => {
      try {
        let wordData = new WordTestData().get(word)
        let json = JSON.parse(wordData)
        resolve(json)
      } catch (error) {
                // Word is not found in test data
        reject(error)
      }
    })
  }

  /**
   * A function that maps a morphological service's specific data types and values into an inflection library standard.
   * @param {object} jsonObj - A JSON data from a Morphological Analyzer.
   * @param {object} targetWord - the target of the analysis
   * @returns {Homonym} A library standard Homonym object.
   */
  transform (jsonObj, targetWord) {
    'use strict'
    let lexemes = []
    let annotationBody = jsonObj.RDF.Annotation.Body
    if (!Array.isArray(annotationBody)) {
            /*
            If only one lexeme is returned, Annotation Body will not be an array but rather a single object.
            Let's convert it to an array so we can work with it in the same way no matter what format it is.
             */
      annotationBody = [annotationBody]
    }
    let provider
    for (let lexeme of annotationBody) {
            // Get importer based on the language
      let language = lexeme.rest.entry.dict.hdwd.lang
      let mappingData = this.getEngineLanguageMap(language)
      let lemma = mappingData.parseLemma(lexeme.rest.entry.dict.hdwd.$, language)

      if (!provider) {
        let providerUri = jsonObj.RDF.Annotation.about
        let providerRights = ''
        if (jsonObj.RDF.Annotation.rights) {
          providerRights = jsonObj.RDF.Annotation.rights.$
        }
        provider = new Models.ResourceProvider(providerUri, providerRights)
      }
      let meaning = lexeme.rest.entry.mean
      let shortdef
      if (meaning) {
        // TODO: convert a source-specific language code to ISO 639-3 if don't match
        let lang = meaning.lang ? meaning.lang : 'eng'
        shortdef = new Models.Definition(meaning.$, lang, 'text/plain')
      }
      let inflections = []
      let inflectionsJSON = lexeme.rest.entry.infl
      if (!Array.isArray(inflectionsJSON)) {
                // If only one inflection returned, it is a single object, not an array of objects. Convert it to an array for uniformity.
        inflectionsJSON = [inflectionsJSON]
      }
      for (let inflectionJSON of inflectionsJSON) {
        let inflection = new Models.Inflection(inflectionJSON.term.stem.$, mappingData.language.toCode())
        if (inflectionJSON.term.suff) {
                    // Set suffix if provided by a morphological analyzer
          inflection.suffix = inflectionJSON.term.suff.$
        }

        if (inflectionJSON.xmpl) {
          inflection.example = inflectionJSON.xmpl.$
        }
                // Parse whatever grammatical features we're interested in
        if (inflectionJSON.pofs) {
          inflection.feature = mappingData[Models.Feature.types.part].get(inflectionJSON.pofs.$)
        }

        if (inflectionJSON.case) {
          inflection.feature = mappingData[Models.Feature.types.grmCase].get(inflectionJSON.case.$)
        }

        if (inflectionJSON.decl) {
          inflection.feature = mappingData[Models.Feature.types.declension].get(inflectionJSON.decl.$)
        }

        if (inflectionJSON.num) {
          inflection.feature = mappingData[Models.Feature.types.number].get(inflectionJSON.num.$)
        }

        if (inflectionJSON.gend) {
          inflection.feature = mappingData[Models.Feature.types.gender].get(inflectionJSON.gend.$)
        }

        if (inflectionJSON.conj) {
          inflection.feature = mappingData[Models.Feature.types.conjugation].get(inflectionJSON.conj.$)
        }

        if (inflectionJSON.tense) {
          inflection.feature = mappingData[Models.Feature.types.tense].get(inflectionJSON.tense.$)
        }

        if (inflectionJSON.voice) {
          inflection.feature = mappingData[Models.Feature.types.voice].get(inflectionJSON.voice.$)
        }

        if (inflectionJSON.mood) {
          inflection.feature = mappingData[Models.Feature.types.mood].get(inflectionJSON.mood.$)
        }

        if (inflectionJSON.pers) {
          inflection.feature = mappingData[Models.Feature.types.person].get(inflectionJSON.pers.$)
        }

        inflections.push(inflection)
      }

      let lexmodel = new Models.Lexeme(lemma, inflections)
      lexmodel.meaning.appendShortDefs(shortdef)
      let providedLexeme = Models.ResourceProvider.getProxy(provider, lexmodel)
      lexemes.push(providedLexeme)
    }
    return new Models.Homonym(lexemes, targetWord)
  }

  async getHomonym (lang, word) {
    let jsonObj = await this.fetch(lang, word)
    if (jsonObj) {
      let homonym = this.transform(jsonObj, word)
      return homonym
    } else {
        // No data found for this word
      return undefined
    }
  }
}

export default TuftsAdapter
