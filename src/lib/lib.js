/*
Objects of a morphology analyzer's library
 */
import * as Models from 'alpheios-data-models'

/**
 * Holds all information required to transform from morphological analyzer's grammatical feature values to the
 * library standards. There is one ImportData object per language.
 */
class ImportData {
    /**
     * Creates an InmportData object for the language provided.
     * @param {Models.LanguageModel} language - A language of the import data.
     */
  constructor (language, engine) {
    'use strict'
    this.language = language
    this.engine = engine
    // add all the features that the language supports so that we
    // can return the default values if we don't need to import a mapping
    for (let featureName of Object.keys(language.features)) {
      this.addFeature(featureName)
    }
    // may be overridden by specific engine use via setLemmaParser
    this.parseLemma = function (lemma) { return lemma }
  }

    /**
     * Adds a grammatical feature whose values to be mapped.
     * @param {string} featureName - A name of a grammatical feature (i.e. declension, number, etc.)
     * @return {Object} An object that represent a newly created grammatical feature.
     */
  addFeature (featureName) {
    this[featureName] = {}
    let language = this.language

    this[featureName].add = function add (providerValue, alpheiosValue) {
      'use strict'
      this[providerValue] = alpheiosValue
      return this
    }

    this[featureName].get = function get (providerValue) {
      'use strict'
      if (!this.importer.has(providerValue)) {
        // if the providerValue matches the model value return that
        if (language.features[featureName][providerValue]) {
          return language.features[featureName][providerValue]
        } else {
          throw new Error("Skipping an unknown value '" +
                    providerValue + "' of a grammatical feature '" + featureName + "' of " + language + ' language.')
        }
      } else {
        return this.importer.get(providerValue)
      }
    }

    this[featureName].importer = new Models.FeatureImporter()

    return this[featureName]
  }

  /**
   * Add an engine-specific lemma parser
   */
  setLemmaParser (callback) {
    this.parseLemma = callback
  }
}
export default ImportData
