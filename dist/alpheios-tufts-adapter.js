import { Feature, FeatureImporter, Homonym, Inflection, LatinLanguageModel, Lemma, Lexeme } from 'alpheios-data-models';

/**
 * Base Adapter Class for a Morphology Service Client
 */
class BaseAdapter {
  /**
   * Method which is used to prepare a lookup request according
   * to the adapter specific logic
   * @param {string} lang - the language code
   * @param {string} word - the word to lookup
   * @returns {string} the url for the request
   */
  prepareRequestUrl (lang, word) {
      /** must be overridden in the adapter implementation class **/
    return null
  }

  /**
   * Fetch response from a remote URL
   * @param {string} lang - the language code
   * @param {string} word - the word to lookup
   * @returns {Promise} a promse which if successful resolves to json response object
   *                    with the results of the analysis
   */
  fetch (lang, word) {
    let url = this.prepareRequestUrl(lang, word);
    return new Promise((resolve, reject) => {
      window.fetch(url).then(
          function (response) {
            let json = response.json();
            resolve(json);
          }
        ).catch((error) => {
          reject(error);
        }
        );
    })
  }

  /**
   * Fetch test data to test the adapter
   * @param {string} lang - the language code
   * @param {string} word - the word to lookup
   * @returns {Promise} a promse which if successful resolves to json response object
   *                    with the test data
   */
  fetchTestData (lang, word) {
    return new Promise((resolve, reject) => {
      try {
        let data = {};
        resolve(data);
      } catch (error) {
        reject(error);
      }
    })
  }

  /**
   * A function that maps a morphological service's specific data types and values into an inflection library standard.
   * @param {object} jsonObj - A JSON data from the fetch request
   * @param {object} targetWord - the original target word of the analysis
   * @returns {Homonym} A library standard Homonym object.
   */
  transform (jsonObj, targetWord) {
    return {}
  }
}

/*
Objects of a morphology analyzer's library
 */
/**
 * Holds all information required to transform from morphological analyzer's grammatical feature values to the
 * library standards. There is one ImportData object per language.
 */
class ImportData {
    /**
     * Creates an InmportData object for the language provided.
     * @param {Models.LanguageModel} language - A language of the import data.
     */
  constructor (language) {
    'use strict';
    this.language = language;
  }

    /**
     * Adds a grammatical feature whose values to be mapped.
     * @param {string} featureName - A name of a grammatical feature (i.e. declension, number, etc.)
     * @return {Object} An object that represent a newly created grammatical feature.
     */
  addFeature (featureName) {
    this[featureName] = {};
    let language = this.language;

    this[featureName].add = function add (providerValue, alpheiosValue) {
      'use strict';
      this[providerValue] = alpheiosValue;
      return this
    };

    this[featureName].get = function get (providerValue) {
      'use strict';
      if (!this.importer.has(providerValue)) {
        throw new Error("Skipping an unknown value '" +
                    providerValue + "' of a grammatical feature '" + featureName + "' of " + language + ' language.')
      } else {
        return this.importer.get(providerValue)
      }
    };

    this[featureName].importer = new FeatureImporter();

    return this[featureName]
  }
}

let data = new ImportData(new LatinLanguageModel());
let types = Feature.types;

/*
Below are value conversion maps for each grammatical feature to be parsed.
Format:
data.addFeature(typeName).add(providerValueName, LibValueName);
(functions are chainable)
Types and values that are unknown (undefined) will be skipped during parsing.
 */
data.addFeature(Feature.types.part).importer
    .map('noun', data.language.features[types.part].noun)
    .map('adjective', data.language.features[types.part].adjective)
    .map('verb', data.language.features[types.part].verb);

data.addFeature(Feature.types.grmCase).importer
    .map('nominative', data.language.features[types.grmCase].nominative)
    .map('genitive', data.language.features[types.grmCase].genitive)
    .map('dative', data.language.features[types.grmCase].dative)
    .map('accusative', data.language.features[types.grmCase].accusative)
    .map('ablative', data.language.features[types.grmCase].ablative)
    .map('locative', data.language.features[types.grmCase].locative)
    .map('vocative', data.language.features[types.grmCase].vocative);

data.addFeature(Feature.types.declension).importer
    .map('1st', data.language.features[types.declension].first)
    .map('2nd', data.language.features[types.declension].second)
    .map('3rd', data.language.features[types.declension].third)
    .map('4th', data.language.features[types.declension].fourth)
    .map('5th', data.language.features[types.declension].fifth);

data.addFeature(Feature.types.number).importer
    .map('singular', data.language.features[types.number].singular)
    .map('plural', data.language.features[types.number].plural);

data.addFeature(Feature.types.gender).importer
    .map('masculine', data.language.features[types.gender].masculine)
    .map('feminine', data.language.features[types.gender].feminine)
    .map('neuter', data.language.features[types.gender].neuter)
    .map('common', [data.language.features[types.gender].masculine, data.language.features[types.gender].feminine])
    .map('all', [data.language.features[types.gender].masculine, data.language.features[types.gender].feminine, data.language.features[types.gender].neuter]);

data.addFeature(Feature.types.conjugation).importer
    .map('1st', data.language.features[types.conjugation].first)
    .map('2nd', data.language.features[types.conjugation].second)
    .map('3rd', data.language.features[types.conjugation].third)
    .map('4th', data.language.features[types.conjugation].fourth);

data.addFeature(Feature.types.tense).importer
    .map('present', data.language.features[types.tense].present)
    .map('imperfect', data.language.features[types.tense].imperfect)
    .map('future', data.language.features[types.tense].future)
    .map('perfect', data.language.features[types.tense].perfect)
    .map('pluperfect', data.language.features[types.tense].pluperfect)
    .map('future_perfect', data.language.features[types.tense]['future perfect']);

data.addFeature(Feature.types.voice).importer
    .map('active', data.language.features[types.voice].active)
    .map('passive', data.language.features[types.voice].passive);

data.addFeature(Feature.types.mood).importer
    .map('indicative', data.language.features[types.mood].indicative)
    .map('subjunctive', data.language.features[types.mood].subjunctive);

data.addFeature(Feature.types.person).importer
    .map('1st', data.language.features[types.person].first)
    .map('2nd', data.language.features[types.person].second)
    .map('3rd', data.language.features[types.person].third);

var Cupidinibus = "{\r\n  \"RDF\": {\r\n    \"Annotation\": {\r\n      \"about\": \"urn:TuftsMorphologyService:cupidinibus:whitakerLat\",\r\n      \"creator\": {\r\n        \"Agent\": {\r\n          \"about\": \"net.alpheios:tools:wordsxml.v1\"\r\n        }\r\n      },\r\n      \"created\": {\r\n        \"$\": \"2017-08-10T23:15:29.185581\"\r\n      },\r\n      \"hasTarget\": {\r\n        \"Description\": {\r\n          \"about\": \"urn:word:cupidinibus\"\r\n        }\r\n      },\r\n      \"title\": {},\r\n      \"hasBody\": [\r\n        {\r\n          \"resource\": \"urn:uuid:idm140578094883136\"\r\n        },\r\n        {\r\n          \"resource\": \"urn:uuid:idm140578158026160\"\r\n        }\r\n      ],\r\n      \"Body\": [\r\n        {\r\n          \"about\": \"urn:uuid:idm140578094883136\",\r\n          \"type\": {\r\n            \"resource\": \"cnt:ContentAsXML\"\r\n          },\r\n          \"rest\": {\r\n            \"entry\": {\r\n              \"infl\": [\r\n                {\r\n                  \"term\": {\r\n                    \"lang\": \"lat\",\r\n                    \"stem\": {\r\n                      \"$\": \"cupidin\"\r\n                    },\r\n                    \"suff\": {\r\n                      \"$\": \"ibus\"\r\n                    }\r\n                  },\r\n                  \"pofs\": {\r\n                    \"order\": 5,\r\n                    \"$\": \"noun\"\r\n                  },\r\n                  \"decl\": {\r\n                    \"$\": \"3rd\"\r\n                  },\r\n                  \"var\": {\r\n                    \"$\": \"1st\"\r\n                  },\r\n                  \"case\": {\r\n                    \"order\": 2,\r\n                    \"$\": \"locative\"\r\n                  },\r\n                  \"num\": {\r\n                    \"$\": \"plural\"\r\n                  },\r\n                  \"gend\": {\r\n                    \"$\": \"masculine\"\r\n                  }\r\n                },\r\n                {\r\n                  \"term\": {\r\n                    \"lang\": \"lat\",\r\n                    \"stem\": {\r\n                      \"$\": \"cupidin\"\r\n                    },\r\n                    \"suff\": {\r\n                      \"$\": \"ibus\"\r\n                    }\r\n                  },\r\n                  \"pofs\": {\r\n                    \"order\": 5,\r\n                    \"$\": \"noun\"\r\n                  },\r\n                  \"decl\": {\r\n                    \"$\": \"3rd\"\r\n                  },\r\n                  \"var\": {\r\n                    \"$\": \"1st\"\r\n                  },\r\n                  \"case\": {\r\n                    \"order\": 5,\r\n                    \"$\": \"dative\"\r\n                  },\r\n                  \"num\": {\r\n                    \"$\": \"plural\"\r\n                  },\r\n                  \"gend\": {\r\n                    \"$\": \"masculine\"\r\n                  }\r\n                },\r\n                {\r\n                  \"term\": {\r\n                    \"lang\": \"lat\",\r\n                    \"stem\": {\r\n                      \"$\": \"cupidin\"\r\n                    },\r\n                    \"suff\": {\r\n                      \"$\": \"ibus\"\r\n                    }\r\n                  },\r\n                  \"pofs\": {\r\n                    \"order\": 5,\r\n                    \"$\": \"noun\"\r\n                  },\r\n                  \"decl\": {\r\n                    \"$\": \"3rd\"\r\n                  },\r\n                  \"var\": {\r\n                    \"$\": \"1st\"\r\n                  },\r\n                  \"case\": {\r\n                    \"order\": 3,\r\n                    \"$\": \"ablative\"\r\n                  },\r\n                  \"num\": {\r\n                    \"$\": \"plural\"\r\n                  },\r\n                  \"gend\": {\r\n                    \"$\": \"masculine\"\r\n                  }\r\n                }\r\n              ],\r\n              \"dict\": {\r\n                \"hdwd\": {\r\n                  \"lang\": \"lat\",\r\n                  \"$\": \"Cupido, Cupidinis\"\r\n                },\r\n                \"pofs\": {\r\n                  \"order\": 5,\r\n                  \"$\": \"noun\"\r\n                },\r\n                \"decl\": {\r\n                  \"$\": \"3rd\"\r\n                },\r\n                \"gend\": {\r\n                  \"$\": \"masculine\"\r\n                },\r\n                \"area\": {\r\n                  \"$\": \"religion\"\r\n                },\r\n                \"freq\": {\r\n                  \"order\": 4,\r\n                  \"$\": \"common\"\r\n                },\r\n                \"src\": {\r\n                  \"$\": \"Ox.Lat.Dict.\"\r\n                }\r\n              },\r\n              \"mean\": {\r\n                \"$\": \"Cupid, son of Venus; personification of carnal desire;\"\r\n              }\r\n            }\r\n          }\r\n        },\r\n        {\r\n          \"about\": \"urn:uuid:idm140578158026160\",\r\n          \"type\": {\r\n            \"resource\": \"cnt:ContentAsXML\"\r\n          },\r\n          \"rest\": {\r\n            \"entry\": {\r\n              \"infl\": [\r\n                {\r\n                  \"term\": {\r\n                    \"lang\": \"lat\",\r\n                    \"stem\": {\r\n                      \"$\": \"cupidin\"\r\n                    },\r\n                    \"suff\": {\r\n                      \"$\": \"ibus\"\r\n                    }\r\n                  },\r\n                  \"pofs\": {\r\n                    \"order\": 5,\r\n                    \"$\": \"noun\"\r\n                  },\r\n                  \"decl\": {\r\n                    \"$\": \"3rd\"\r\n                  },\r\n                  \"var\": {\r\n                    \"$\": \"1st\"\r\n                  },\r\n                  \"case\": {\r\n                    \"order\": 2,\r\n                    \"$\": \"locative\"\r\n                  },\r\n                  \"num\": {\r\n                    \"$\": \"plural\"\r\n                  },\r\n                  \"gend\": {\r\n                    \"$\": \"common\"\r\n                  }\r\n                },\r\n                {\r\n                  \"term\": {\r\n                    \"lang\": \"lat\",\r\n                    \"stem\": {\r\n                      \"$\": \"cupidin\"\r\n                    },\r\n                    \"suff\": {\r\n                      \"$\": \"ibus\"\r\n                    }\r\n                  },\r\n                  \"pofs\": {\r\n                    \"order\": 5,\r\n                    \"$\": \"noun\"\r\n                  },\r\n                  \"decl\": {\r\n                    \"$\": \"3rd\"\r\n                  },\r\n                  \"var\": {\r\n                    \"$\": \"1st\"\r\n                  },\r\n                  \"case\": {\r\n                    \"order\": 5,\r\n                    \"$\": \"dative\"\r\n                  },\r\n                  \"num\": {\r\n                    \"$\": \"plural\"\r\n                  },\r\n                  \"gend\": {\r\n                    \"$\": \"common\"\r\n                  }\r\n                },\r\n                {\r\n                  \"term\": {\r\n                    \"lang\": \"lat\",\r\n                    \"stem\": {\r\n                      \"$\": \"cupidin\"\r\n                    },\r\n                    \"suff\": {\r\n                      \"$\": \"ibus\"\r\n                    }\r\n                  },\r\n                  \"pofs\": {\r\n                    \"order\": 5,\r\n                    \"$\": \"noun\"\r\n                  },\r\n                  \"decl\": {\r\n                    \"$\": \"3rd\"\r\n                  },\r\n                  \"var\": {\r\n                    \"$\": \"1st\"\r\n                  },\r\n                  \"case\": {\r\n                    \"order\": 3,\r\n                    \"$\": \"ablative\"\r\n                  },\r\n                  \"num\": {\r\n                    \"$\": \"plural\"\r\n                  },\r\n                  \"gend\": {\r\n                    \"$\": \"common\"\r\n                  }\r\n                }\r\n              ],\r\n              \"dict\": {\r\n                \"hdwd\": {\r\n                  \"lang\": \"lat\",\r\n                  \"$\": \"cupido, cupidinis\"\r\n                },\r\n                \"pofs\": {\r\n                  \"order\": 5,\r\n                  \"$\": \"noun\"\r\n                },\r\n                \"decl\": {\r\n                  \"$\": \"3rd\"\r\n                },\r\n                \"gend\": {\r\n                  \"$\": \"common\"\r\n                },\r\n                \"freq\": {\r\n                  \"order\": 5,\r\n                  \"$\": \"frequent\"\r\n                },\r\n                \"src\": {\r\n                  \"$\": \"Ox.Lat.Dict.\"\r\n                }\r\n              },\r\n              \"mean\": {\r\n                \"$\": \"desire/love/wish/longing (passionate); lust; greed, appetite; desire for gain;\"\r\n              }\r\n            }\r\n          }\r\n        }\r\n      ]\r\n    }\r\n  }\r\n}\r\n";

var Mare = "{\r\n  \"RDF\": {\r\n    \"Annotation\": {\r\n      \"about\": \"urn:TuftsMorphologyService:mare:morpheuslat\",\r\n      \"creator\": {\r\n        \"Agent\": {\r\n          \"about\": \"org.perseus:tools:morpheus.v1\"\r\n        }\r\n      },\r\n      \"created\": {\r\n        \"$\": \"2017-09-08T06:59:48.639180\"\r\n      },\r\n      \"hasTarget\": {\r\n        \"Description\": {\r\n          \"about\": \"urn:word:mare\"\r\n        }\r\n      },\r\n      \"title\": {},\r\n      \"hasBody\": [\r\n        {\r\n          \"resource\": \"urn:uuid:idm140446402389888\"\r\n        },\r\n        {\r\n          \"resource\": \"urn:uuid:idm140446402332400\"\r\n        },\r\n        {\r\n          \"resource\": \"urn:uuid:idm140446402303648\"\r\n        }\r\n      ],\r\n      \"Body\": [\r\n        {\r\n          \"about\": \"urn:uuid:idm140446402389888\",\r\n          \"type\": {\r\n            \"resource\": \"cnt:ContentAsXML\"\r\n          },\r\n          \"rest\": {\r\n            \"entry\": {\r\n              \"uri\": \"http://data.perseus.org/collections/urn:cite:perseus:latlexent.lex34070.1\",\r\n              \"dict\": {\r\n                \"hdwd\": {\r\n                  \"lang\": \"lat\",\r\n                  \"$\": \"mare\"\r\n                },\r\n                \"pofs\": {\r\n                  \"order\": 3,\r\n                  \"$\": \"noun\"\r\n                },\r\n                \"decl\": {\r\n                  \"$\": \"3rd\"\r\n                },\r\n                \"gend\": {\r\n                  \"$\": \"neuter\"\r\n                }\r\n              },\r\n              \"infl\": [\r\n                {\r\n                  \"term\": {\r\n                    \"lang\": \"lat\",\r\n                    \"stem\": {\r\n                      \"$\": \"mar\"\r\n                    },\r\n                    \"suff\": {\r\n                      \"$\": \"e\"\r\n                    }\r\n                  },\r\n                  \"pofs\": {\r\n                    \"order\": 3,\r\n                    \"$\": \"noun\"\r\n                  },\r\n                  \"decl\": {\r\n                    \"$\": \"3rd\"\r\n                  },\r\n                  \"case\": {\r\n                    \"order\": 3,\r\n                    \"$\": \"ablative\"\r\n                  },\r\n                  \"gend\": {\r\n                    \"$\": \"neuter\"\r\n                  },\r\n                  \"num\": {\r\n                    \"$\": \"singular\"\r\n                  },\r\n                  \"stemtype\": {\r\n                    \"$\": \"is_is\"\r\n                  }\r\n                },\r\n                {\r\n                  \"term\": {\r\n                    \"lang\": \"lat\",\r\n                    \"stem\": {\r\n                      \"$\": \"mar\"\r\n                    },\r\n                    \"suff\": {\r\n                      \"$\": \"e\"\r\n                    }\r\n                  },\r\n                  \"pofs\": {\r\n                    \"order\": 3,\r\n                    \"$\": \"noun\"\r\n                  },\r\n                  \"decl\": {\r\n                    \"$\": \"3rd\"\r\n                  },\r\n                  \"case\": {\r\n                    \"order\": 7,\r\n                    \"$\": \"nominative\"\r\n                  },\r\n                  \"gend\": {\r\n                    \"$\": \"neuter\"\r\n                  },\r\n                  \"num\": {\r\n                    \"$\": \"singular\"\r\n                  },\r\n                  \"stemtype\": {\r\n                    \"$\": \"is_is\"\r\n                  }\r\n                },\r\n                {\r\n                  \"term\": {\r\n                    \"lang\": \"lat\",\r\n                    \"stem\": {\r\n                      \"$\": \"mar\"\r\n                    },\r\n                    \"suff\": {\r\n                      \"$\": \"e\"\r\n                    }\r\n                  },\r\n                  \"pofs\": {\r\n                    \"order\": 3,\r\n                    \"$\": \"noun\"\r\n                  },\r\n                  \"decl\": {\r\n                    \"$\": \"3rd\"\r\n                  },\r\n                  \"case\": {\r\n                    \"order\": 1,\r\n                    \"$\": \"vocative\"\r\n                  },\r\n                  \"gend\": {\r\n                    \"$\": \"neuter\"\r\n                  },\r\n                  \"num\": {\r\n                    \"$\": \"singular\"\r\n                  },\r\n                  \"stemtype\": {\r\n                    \"$\": \"is_is\"\r\n                  }\r\n                },\r\n                {\r\n                  \"term\": {\r\n                    \"lang\": \"lat\",\r\n                    \"stem\": {\r\n                      \"$\": \"mar\"\r\n                    },\r\n                    \"suff\": {\r\n                      \"$\": \"e\"\r\n                    }\r\n                  },\r\n                  \"pofs\": {\r\n                    \"order\": 3,\r\n                    \"$\": \"noun\"\r\n                  },\r\n                  \"decl\": {\r\n                    \"$\": \"3rd\"\r\n                  },\r\n                  \"case\": {\r\n                    \"order\": 4,\r\n                    \"$\": \"accusative\"\r\n                  },\r\n                  \"gend\": {\r\n                    \"$\": \"neuter\"\r\n                  },\r\n                  \"num\": {\r\n                    \"$\": \"singular\"\r\n                  },\r\n                  \"stemtype\": {\r\n                    \"$\": \"is_is\"\r\n                  }\r\n                }\r\n              ]\r\n            }\r\n          }\r\n        },\r\n        {\r\n          \"about\": \"urn:uuid:idm140446402332400\",\r\n          \"type\": {\r\n            \"resource\": \"cnt:ContentAsXML\"\r\n          },\r\n          \"rest\": {\r\n            \"entry\": {\r\n              \"uri\": \"http://data.perseus.org/collections/urn:cite:perseus:latlexent.lex34118.1\",\r\n              \"dict\": {\r\n                \"hdwd\": {\r\n                  \"lang\": \"lat\",\r\n                  \"$\": \"marum\"\r\n                },\r\n                \"pofs\": {\r\n                  \"order\": 3,\r\n                  \"$\": \"noun\"\r\n                },\r\n                \"decl\": {\r\n                  \"$\": \"2nd\"\r\n                },\r\n                \"gend\": {\r\n                  \"$\": \"neuter\"\r\n                }\r\n              },\r\n              \"infl\": {\r\n                \"term\": {\r\n                  \"lang\": \"lat\",\r\n                  \"stem\": {\r\n                    \"$\": \"mar\"\r\n                  },\r\n                  \"suff\": {\r\n                    \"$\": \"e\"\r\n                  }\r\n                },\r\n                \"pofs\": {\r\n                  \"order\": 3,\r\n                  \"$\": \"noun\"\r\n                },\r\n                \"decl\": {\r\n                  \"$\": \"2nd\"\r\n                },\r\n                \"case\": {\r\n                  \"order\": 1,\r\n                  \"$\": \"vocative\"\r\n                },\r\n                \"gend\": {\r\n                  \"$\": \"neuter\"\r\n                },\r\n                \"num\": {\r\n                  \"$\": \"singular\"\r\n                },\r\n                \"stemtype\": {\r\n                  \"$\": \"us_i\"\r\n                }\r\n              }\r\n            }\r\n          }\r\n        },\r\n        {\r\n          \"about\": \"urn:uuid:idm140446402303648\",\r\n          \"type\": {\r\n            \"resource\": \"cnt:ContentAsXML\"\r\n          },\r\n          \"rest\": {\r\n            \"entry\": {\r\n              \"uri\": \"http://data.perseus.org/collections/urn:cite:perseus:latlexent.lex34119.1\",\r\n              \"dict\": {\r\n                \"hdwd\": {\r\n                  \"lang\": \"lat\",\r\n                  \"$\": \"mas\"\r\n                },\r\n                \"pofs\": {\r\n                  \"order\": 2,\r\n                  \"$\": \"adjective\"\r\n                },\r\n                \"decl\": {\r\n                  \"$\": \"3rd\"\r\n                }\r\n              },\r\n              \"infl\": [\r\n                {\r\n                  \"term\": {\r\n                    \"lang\": \"lat\",\r\n                    \"stem\": {\r\n                      \"$\": \"mare\"\r\n                    }\r\n                  },\r\n                  \"pofs\": {\r\n                    \"order\": 2,\r\n                    \"$\": \"adjective\"\r\n                  },\r\n                  \"decl\": {\r\n                    \"$\": \"3rd\"\r\n                  },\r\n                  \"case\": {\r\n                    \"order\": 3,\r\n                    \"$\": \"ablative\"\r\n                  },\r\n                  \"gend\": {\r\n                    \"$\": \"masculine\"\r\n                  },\r\n                  \"num\": {\r\n                    \"$\": \"singular\"\r\n                  },\r\n                  \"stemtype\": {\r\n                    \"$\": \"irreg_adj3\"\r\n                  },\r\n                  \"morph\": {\r\n                    \"$\": \"indeclform\"\r\n                  }\r\n                },\r\n                {\r\n                  \"term\": {\r\n                    \"lang\": \"lat\",\r\n                    \"stem\": {\r\n                      \"$\": \"mare\"\r\n                    }\r\n                  },\r\n                  \"pofs\": {\r\n                    \"order\": 2,\r\n                    \"$\": \"adjective\"\r\n                  },\r\n                  \"decl\": {\r\n                    \"$\": \"3rd\"\r\n                  },\r\n                  \"case\": {\r\n                    \"order\": 3,\r\n                    \"$\": \"ablative\"\r\n                  },\r\n                  \"gend\": {\r\n                    \"$\": \"feminine\"\r\n                  },\r\n                  \"num\": {\r\n                    \"$\": \"singular\"\r\n                  },\r\n                  \"stemtype\": {\r\n                    \"$\": \"irreg_adj3\"\r\n                  },\r\n                  \"morph\": {\r\n                    \"$\": \"indeclform\"\r\n                  }\r\n                },\r\n                {\r\n                  \"term\": {\r\n                    \"lang\": \"lat\",\r\n                    \"stem\": {\r\n                      \"$\": \"mare\"\r\n                    }\r\n                  },\r\n                  \"pofs\": {\r\n                    \"order\": 2,\r\n                    \"$\": \"adjective\"\r\n                  },\r\n                  \"decl\": {\r\n                    \"$\": \"3rd\"\r\n                  },\r\n                  \"case\": {\r\n                    \"order\": 3,\r\n                    \"$\": \"ablative\"\r\n                  },\r\n                  \"gend\": {\r\n                    \"$\": \"neuter\"\r\n                  },\r\n                  \"num\": {\r\n                    \"$\": \"singular\"\r\n                  },\r\n                  \"stemtype\": {\r\n                    \"$\": \"irreg_adj3\"\r\n                  },\r\n                  \"morph\": {\r\n                    \"$\": \"indeclform\"\r\n                  }\r\n                }\r\n              ]\r\n            }\r\n          }\r\n        }\r\n      ]\r\n    }\r\n  }\r\n}";

var Cepit = "{\r\n  \"RDF\": {\r\n    \"Annotation\": {\r\n      \"about\": \"urn:TuftsMorphologyService:cepit:whitakerLat\",\r\n      \"creator\": {\r\n        \"Agent\": {\r\n          \"about\": \"net.alpheios:tools:wordsxml.v1\"\r\n        }\r\n      },\r\n      \"created\": {\r\n        \"$\": \"2017-08-10T23:16:53.672068\"\r\n      },\r\n      \"hasTarget\": {\r\n        \"Description\": {\r\n          \"about\": \"urn:word:cepit\"\r\n        }\r\n      },\r\n      \"title\": {},\r\n      \"hasBody\": {\r\n        \"resource\": \"urn:uuid:idm140578133848416\"\r\n      },\r\n      \"Body\": {\r\n        \"about\": \"urn:uuid:idm140578133848416\",\r\n        \"type\": {\r\n          \"resource\": \"cnt:ContentAsXML\"\r\n        },\r\n        \"rest\": {\r\n          \"entry\": {\r\n            \"infl\": {\r\n              \"term\": {\r\n                \"lang\": \"lat\",\r\n                \"stem\": {\r\n                  \"$\": \"cep\"\r\n                },\r\n                \"suff\": {\r\n                  \"$\": \"it\"\r\n                }\r\n              },\r\n              \"pofs\": {\r\n                \"order\": 3,\r\n                \"$\": \"verb\"\r\n              },\r\n              \"conj\": {\r\n                \"$\": \"3rd\"\r\n              },\r\n              \"var\": {\r\n                \"$\": \"1st\"\r\n              },\r\n              \"tense\": {\r\n                \"$\": \"perfect\"\r\n              },\r\n              \"voice\": {\r\n                \"$\": \"active\"\r\n              },\r\n              \"mood\": {\r\n                \"$\": \"indicative\"\r\n              },\r\n              \"pers\": {\r\n                \"$\": \"3rd\"\r\n              },\r\n              \"num\": {\r\n                \"$\": \"singular\"\r\n              }\r\n            },\r\n            \"dict\": {\r\n              \"hdwd\": {\r\n                \"lang\": \"lat\",\r\n                \"$\": \"capio, capere, cepi, captus\"\r\n              },\r\n              \"pofs\": {\r\n                \"order\": 3,\r\n                \"$\": \"verb\"\r\n              },\r\n              \"conj\": {\r\n                \"$\": \"3rd\"\r\n              },\r\n              \"kind\": {\r\n                \"$\": \"transitive\"\r\n              },\r\n              \"freq\": {\r\n                \"order\": 6,\r\n                \"$\": \"very frequent\"\r\n              },\r\n              \"src\": {\r\n                \"$\": \"Ox.Lat.Dict.\"\r\n              }\r\n            },\r\n            \"mean\": {\r\n              \"$\": \"take hold, seize; grasp; take bribe; arrest/capture; put on; occupy; captivate;\"\r\n            }\r\n          }\r\n        }\r\n      }\r\n    }\r\n  }\r\n}\r\n";

var Pilsopo = "{\r\n  \"RDF\": {\r\n    \"Annotation\": {\r\n      \"about\": \"urn:TuftsMorphologyService:φιλόσοφος:morpheuslat\",\r\n      \"creator\": {\r\n        \"Agent\": {\r\n          \"about\": \"org.perseus:tools:morpheus.v1\"\r\n        }\r\n      },\r\n      \"created\": {\r\n        \"$\": \"2017-10-15T14:06:40.522369\"\r\n      },\r\n      \"hasTarget\": {\r\n        \"Description\": {\r\n          \"about\": \"urn:word:φιλόσοφος\"\r\n        }\r\n      },\r\n      \"title\": {},\r\n      \"hasBody\": {\r\n        \"resource\": \"urn:uuid:idm140446394225264\"\r\n      },\r\n      \"Body\": {\r\n        \"about\": \"urn:uuid:idm140446394225264\",\r\n        \"type\": {\r\n          \"resource\": \"cnt:ContentAsXML\"\r\n        },\r\n        \"rest\": {\r\n          \"entry\": {\r\n            \"uri\": \"http://data.perseus.org/collections/urn:cite:perseus:grclexent.lex78378.1\",\r\n            \"dict\": {\r\n              \"hdwd\": {\r\n                \"lang\": \"grc\",\r\n                \"$\": \"φιλόσοφος\"\r\n              },\r\n              \"pofs\": {\r\n                \"order\": 3,\r\n                \"$\": \"noun\"\r\n              },\r\n              \"decl\": {\r\n                \"$\": \"2nd\"\r\n              },\r\n              \"gend\": {\r\n                \"$\": \"masculine\"\r\n              }\r\n            },\r\n            \"infl\": {\r\n              \"term\": {\r\n                \"lang\": \"grc\",\r\n                \"stem\": {\r\n                  \"$\": \"φιλοσοφ\"\r\n                },\r\n                \"suff\": {\r\n                  \"$\": \"ος\"\r\n                }\r\n              },\r\n              \"pofs\": {\r\n                \"order\": 3,\r\n                \"$\": \"noun\"\r\n              },\r\n              \"decl\": {\r\n                \"$\": \"2nd\"\r\n              },\r\n              \"case\": {\r\n                \"order\": 7,\r\n                \"$\": \"nominative\"\r\n              },\r\n              \"gend\": {\r\n                \"$\": \"masculine\"\r\n              },\r\n              \"num\": {\r\n                \"$\": \"singular\"\r\n              },\r\n              \"stemtype\": {\r\n                \"$\": \"os_ou\"\r\n              }\r\n            }\r\n          }\r\n        }\r\n      }\r\n    }\r\n  }\r\n}";

class WordTestData {
  constructor () {
    this._words = {
      'cupidinibus': Cupidinibus,
      'mare': Mare,
      'cepit': Cepit,
      'φιλόσοφος': Pilsopo
    };
  }

  get (word) {
    if (this._words.hasOwnProperty(word)) {
      return this._words[word]
    }
    throw new Error(`Word "${word}" does not exist in test data`)
  }
}

class TuftsAdapter extends BaseAdapter {
  constructor ({engine = null, url = null}) {
    super();
    let latinCode = data.language.toCode();
    this[latinCode] = data;
      // this[Lib.languages.greek] = TuftsGreekData;
      // this.langMap = new Map([['lat', TuftsLatinData]]);
      // this.langMap = new Lib.Importer().map('lat', Lib.languages.latin).map('grc', Lib.languages.greek);
    this.langMap = new FeatureImporter().map('lat', latinCode);
    this.engineLookup = engine;
    this.url = url;
    return this
  }

  prepareRequestUrl (lang, word) {
    let engine = this.engineLookup[lang];
    let url = this.url.replace('r_WORD', word).replace('r_ENGINE', engine).replace('r_LANG', lang);
    return url
  }

  fetchTestData (lang, word) {
    return new Promise((resolve, reject) => {
      try {
        let wordData = new WordTestData().get(word);
        console.log(wordData);
        let json = JSON.parse(wordData);
        resolve(json);
      } catch (error) {
                // Word is not found in test data
        reject(error);
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
    'use strict';
    let lexemes = [];
    let annotationBody = jsonObj.RDF.Annotation.Body;
    if (!Array.isArray(annotationBody)) {
            /*
            If only one lexeme is returned, Annotation Body will not be an array but rather a single object.
            Let's convert it to an array so we can work with it in the same way no matter what format it is.
             */
      annotationBody = [annotationBody];
    }
    for (let lexeme of annotationBody) {
            // Get importer based on the language
      let language = this.langMap.get(lexeme.rest.entry.dict.hdwd.lang);
      let lemma = new Lemma(lexeme.rest.entry.dict.hdwd.$, language);
      let meaning = lexeme.rest.entry.mean ? lexeme.rest.entry.mean.$ : '';

      let inflections = [];
      let inflectionsJSON = lexeme.rest.entry.infl;
      if (!Array.isArray(inflectionsJSON)) {
                // If only one inflection returned, it is a single object, not an array of objects. Convert it to an array for uniformity.
        inflectionsJSON = [inflectionsJSON];
      }
      for (let inflectionJSON of inflectionsJSON) {
        let inflection = new Inflection(inflectionJSON.term.stem.$, this[language].language.toCode());
        if (inflectionJSON.term.suff) {
                    // Set suffix if provided by a morphological analyzer
          inflection.suffix = inflectionJSON.term.suff.$;
        }

                // Parse whatever grammatical features we're interested in
        if (inflectionJSON.pofs) {
          inflection.feature = this[language][Feature.types.part].get(inflectionJSON.pofs.$);
        }

        if (inflectionJSON.case) {
          inflection.feature = this[language][Feature.types.grmCase].get(inflectionJSON.case.$);
        }

        if (inflectionJSON.decl) {
          inflection.feature = this[language][Feature.types.declension].get(inflectionJSON.decl.$);
        }

        if (inflectionJSON.num) {
          inflection.feature = this[language][Feature.types.number].get(inflectionJSON.num.$);
        }

        if (inflectionJSON.gend) {
          inflection.feature = this[language][Feature.types.gender].get(inflectionJSON.gend.$);
        }

        if (inflectionJSON.conj) {
          inflection.feature = this[language][Feature.types.conjugation].get(inflectionJSON.conj.$);
        }

        if (inflectionJSON.tense) {
          inflection.feature = this[language][Feature.types.tense].get(inflectionJSON.tense.$);
        }

        if (inflectionJSON.voice) {
          inflection.feature = this[language][Feature.types.voice].get(inflectionJSON.voice.$);
        }

        if (inflectionJSON.mood) {
          inflection.feature = this[language][Feature.types.mood].get(inflectionJSON.mood.$);
        }

        if (inflectionJSON.pers) {
          inflection.feature = this[language][Feature.types.person].get(inflectionJSON.pers.$);
        }

        inflections.push(inflection);
      }
      lexemes.push(new Lexeme(lemma, inflections, meaning));
    }
    return new Homonym(lexemes, targetWord)
  }

    async getHomonym(lang, word) {
      let jsonObj = await this.fetch(lang, word);
      if (jsonObj) {
        let homonym = this.transform(jsonObj, word);
        return homonym
      }
      else {
        // No data found for this word
        return undefined
      }
    }
}

export default TuftsAdapter;
