import { ArabicLanguageModel, Constants, Definition, Feature, FeatureImporter, GreekLanguageModel, Homonym, Inflection, LatinLanguageModel, Lemma, Lexeme, ResourceProvider } from 'alpheios-data-models';

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
      if (url) {
        window.fetch(url).then(
            function (response) {
              let json = response.json();
              resolve(json);
            }
          ).catch((error) => {
            reject(error);
          }
        );
      } else {
        reject(new Error(`Unable to prepare parser request url for ${lang}`));
      }
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
  constructor (language, engine) {
    'use strict';
    this.language = language;
    this.engine = engine;
    // add all the features that the language supports so that we
    // can return the default values if we don't need to import a mapping
    for (let featureName of Object.keys(language.features)) {
      this.addFeature(featureName);
    }
    // may be overridden by specific engine use via setLemmaParser
    this.parseLemma = function (lemma) { return new Lemma(lemma, this.language.toCode()) };
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
    };

    this[featureName].importer = new FeatureImporter();

    return this[featureName]
  }

  /**
   * Add an engine-specific lemma parser
   */
  setLemmaParser (callback) {
    this.parseLemma = callback;
  }
}

let data = new ImportData(new LatinLanguageModel(), 'whitakerLat');
let types = Feature.types;

/*
Below are value conversion maps for each grammatical feature to be parsed.
Format:
data.addFeature(typeName).add(providerValueName, LibValueName);
(functions are chainable)
Types and values that are unknown (undefined) will be skipped during parsing.
 */

 // TODO  - per inflections.xsd
 // Whitakers Words uses packon and tackon in POFS, not sure how

data.addFeature(Feature.types.gender).importer
    .map('common',
  [ data.language.features[types.gender][Constants.GEND_MASCULINE],
    data.language.features[types.gender][Constants.GEND_FEMININE]
  ])
    .map('all',
  [ data.language.features[types.gender][Constants.GEND_MASCULINE],
    data.language.features[types.gender][Constants.GEND_FEMININE],
    data.language.features[types.gender][Constants.GEND_NEUTER]
  ]);

data.addFeature(Feature.types.tense).importer
    .map('future_perfect', data.language.features[types.tense][Constants.TENSE_FUTURE_PERFECT]);

data.setLemmaParser(function (lemma) {
  // Whitaker's Words returns principal parts for some words
  // and sometimes has a space separted stem and suffix
  let parsed, primary;
  let parts = [];
  let lemmas = lemma.split(', ');
  for (let [index, l] of lemmas.entries()) {
    let normalized = l.split(' ')[0];
    if (index === 0) {
      primary = normalized;
    }
    parts.push(normalized);
  }
  if (primary) {
    parsed = new Lemma(primary, this.language.toCode(), parts);
  }

  return parsed
});

let data$1 = new ImportData(new GreekLanguageModel(), 'morpheusgrc');
let types$1 = Feature.types;

/*
Below are value conversion maps for each grammatical feature to be parsed.
Format:
data.addFeature(typeName).add(providerValueName, LibValueName);
(functions are chainable)
Types and values that are unknown (undefined) will be skipped during parsing.
 */

data$1.addFeature(Feature.types.gender).importer
    .map('masculine feminine',
  [ data$1.language.features[types$1.gender][Constants.GEND_MASCULINE],
    data$1.language.features[types$1.gender][Constants.GEND_FEMININE]
  ]);

data$1.addFeature(Feature.types.declension).importer
    .map('1st & 2nd',
  [ data$1.language.features[types$1.declension][Constants.ORD_1ST],
    data$1.language.features[types$1.declension][Constants.ORD_2ND]
  ]);

let data$2 = new ImportData(new ArabicLanguageModel(), 'aramorph');
let types$2 = Feature.types;

data$2.addFeature(Feature.types.part).importer
    .map('proper noun', [data$2.language.features[types$2.part][Constants.POFS_NOUN]]);

var Cupidinibus = "{\r\n  \"RDF\": {\r\n    \"Annotation\": {\r\n      \"about\": \"urn:TuftsMorphologyService:cupidinibus:whitakerLat\",\r\n      \"creator\": {\r\n        \"Agent\": {\r\n          \"about\": \"net.alpheios:tools:wordsxml.v1\"\r\n        }\r\n      },\r\n      \"created\": {\r\n        \"$\": \"2017-08-10T23:15:29.185581\"\r\n      },\r\n      \"hasTarget\": {\r\n        \"Description\": {\r\n          \"about\": \"urn:word:cupidinibus\"\r\n        }\r\n      },\r\n      \"title\": {},\r\n      \"hasBody\": [\r\n        {\r\n          \"resource\": \"urn:uuid:idm140578094883136\"\r\n        },\r\n        {\r\n          \"resource\": \"urn:uuid:idm140578158026160\"\r\n        }\r\n      ],\r\n      \"Body\": [\r\n        {\r\n          \"about\": \"urn:uuid:idm140578094883136\",\r\n          \"type\": {\r\n            \"resource\": \"cnt:ContentAsXML\"\r\n          },\r\n          \"rest\": {\r\n            \"entry\": {\r\n              \"infl\": [\r\n                {\r\n                  \"term\": {\r\n                    \"lang\": \"lat\",\r\n                    \"stem\": {\r\n                      \"$\": \"cupidin\"\r\n                    },\r\n                    \"suff\": {\r\n                      \"$\": \"ibus\"\r\n                    }\r\n                  },\r\n                  \"pofs\": {\r\n                    \"order\": 5,\r\n                    \"$\": \"noun\"\r\n                  },\r\n                  \"decl\": {\r\n                    \"$\": \"3rd\"\r\n                  },\r\n                  \"var\": {\r\n                    \"$\": \"1st\"\r\n                  },\r\n                  \"case\": {\r\n                    \"order\": 2,\r\n                    \"$\": \"locative\"\r\n                  },\r\n                  \"num\": {\r\n                    \"$\": \"plural\"\r\n                  },\r\n                  \"gend\": {\r\n                    \"$\": \"masculine\"\r\n                  }\r\n                },\r\n                {\r\n                  \"term\": {\r\n                    \"lang\": \"lat\",\r\n                    \"stem\": {\r\n                      \"$\": \"cupidin\"\r\n                    },\r\n                    \"suff\": {\r\n                      \"$\": \"ibus\"\r\n                    }\r\n                  },\r\n                  \"pofs\": {\r\n                    \"order\": 5,\r\n                    \"$\": \"noun\"\r\n                  },\r\n                  \"decl\": {\r\n                    \"$\": \"3rd\"\r\n                  },\r\n                  \"var\": {\r\n                    \"$\": \"1st\"\r\n                  },\r\n                  \"case\": {\r\n                    \"order\": 5,\r\n                    \"$\": \"dative\"\r\n                  },\r\n                  \"num\": {\r\n                    \"$\": \"plural\"\r\n                  },\r\n                  \"gend\": {\r\n                    \"$\": \"masculine\"\r\n                  }\r\n                },\r\n                {\r\n                  \"term\": {\r\n                    \"lang\": \"lat\",\r\n                    \"stem\": {\r\n                      \"$\": \"cupidin\"\r\n                    },\r\n                    \"suff\": {\r\n                      \"$\": \"ibus\"\r\n                    }\r\n                  },\r\n                  \"pofs\": {\r\n                    \"order\": 5,\r\n                    \"$\": \"noun\"\r\n                  },\r\n                  \"decl\": {\r\n                    \"$\": \"3rd\"\r\n                  },\r\n                  \"var\": {\r\n                    \"$\": \"1st\"\r\n                  },\r\n                  \"case\": {\r\n                    \"order\": 3,\r\n                    \"$\": \"ablative\"\r\n                  },\r\n                  \"num\": {\r\n                    \"$\": \"plural\"\r\n                  },\r\n                  \"gend\": {\r\n                    \"$\": \"masculine\"\r\n                  }\r\n                }\r\n              ],\r\n              \"dict\": {\r\n                \"hdwd\": {\r\n                  \"lang\": \"lat\",\r\n                  \"$\": \"Cupido, Cupidinis\"\r\n                },\r\n                \"pofs\": {\r\n                  \"order\": 5,\r\n                  \"$\": \"noun\"\r\n                },\r\n                \"decl\": {\r\n                  \"$\": \"3rd\"\r\n                },\r\n                \"gend\": {\r\n                  \"$\": \"masculine\"\r\n                },\r\n                \"area\": {\r\n                  \"$\": \"religion\"\r\n                },\r\n                \"freq\": {\r\n                  \"order\": 4,\r\n                  \"$\": \"common\"\r\n                },\r\n                \"src\": {\r\n                  \"$\": \"Ox.Lat.Dict.\"\r\n                }\r\n              },\r\n              \"mean\": {\r\n                \"$\": \"Cupid, son of Venus; personification of carnal desire;\"\r\n              }\r\n            }\r\n          }\r\n        },\r\n        {\r\n          \"about\": \"urn:uuid:idm140578158026160\",\r\n          \"type\": {\r\n            \"resource\": \"cnt:ContentAsXML\"\r\n          },\r\n          \"rest\": {\r\n            \"entry\": {\r\n              \"infl\": [\r\n                {\r\n                  \"term\": {\r\n                    \"lang\": \"lat\",\r\n                    \"stem\": {\r\n                      \"$\": \"cupidin\"\r\n                    },\r\n                    \"suff\": {\r\n                      \"$\": \"ibus\"\r\n                    }\r\n                  },\r\n                  \"pofs\": {\r\n                    \"order\": 5,\r\n                    \"$\": \"noun\"\r\n                  },\r\n                  \"decl\": {\r\n                    \"$\": \"3rd\"\r\n                  },\r\n                  \"var\": {\r\n                    \"$\": \"1st\"\r\n                  },\r\n                  \"case\": {\r\n                    \"order\": 2,\r\n                    \"$\": \"locative\"\r\n                  },\r\n                  \"num\": {\r\n                    \"$\": \"plural\"\r\n                  },\r\n                  \"gend\": {\r\n                    \"$\": \"common\"\r\n                  }\r\n                },\r\n                {\r\n                  \"term\": {\r\n                    \"lang\": \"lat\",\r\n                    \"stem\": {\r\n                      \"$\": \"cupidin\"\r\n                    },\r\n                    \"suff\": {\r\n                      \"$\": \"ibus\"\r\n                    }\r\n                  },\r\n                  \"pofs\": {\r\n                    \"order\": 5,\r\n                    \"$\": \"noun\"\r\n                  },\r\n                  \"decl\": {\r\n                    \"$\": \"3rd\"\r\n                  },\r\n                  \"var\": {\r\n                    \"$\": \"1st\"\r\n                  },\r\n                  \"case\": {\r\n                    \"order\": 5,\r\n                    \"$\": \"dative\"\r\n                  },\r\n                  \"num\": {\r\n                    \"$\": \"plural\"\r\n                  },\r\n                  \"gend\": {\r\n                    \"$\": \"common\"\r\n                  }\r\n                },\r\n                {\r\n                  \"term\": {\r\n                    \"lang\": \"lat\",\r\n                    \"stem\": {\r\n                      \"$\": \"cupidin\"\r\n                    },\r\n                    \"suff\": {\r\n                      \"$\": \"ibus\"\r\n                    }\r\n                  },\r\n                  \"pofs\": {\r\n                    \"order\": 5,\r\n                    \"$\": \"noun\"\r\n                  },\r\n                  \"decl\": {\r\n                    \"$\": \"3rd\"\r\n                  },\r\n                  \"var\": {\r\n                    \"$\": \"1st\"\r\n                  },\r\n                  \"case\": {\r\n                    \"order\": 3,\r\n                    \"$\": \"ablative\"\r\n                  },\r\n                  \"num\": {\r\n                    \"$\": \"plural\"\r\n                  },\r\n                  \"gend\": {\r\n                    \"$\": \"common\"\r\n                  }\r\n                }\r\n              ],\r\n              \"dict\": {\r\n                \"hdwd\": {\r\n                  \"lang\": \"lat\",\r\n                  \"$\": \"cupido, cupidinis\"\r\n                },\r\n                \"pofs\": {\r\n                  \"order\": 5,\r\n                  \"$\": \"noun\"\r\n                },\r\n                \"decl\": {\r\n                  \"$\": \"3rd\"\r\n                },\r\n                \"gend\": {\r\n                  \"$\": \"common\"\r\n                },\r\n                \"freq\": {\r\n                  \"order\": 5,\r\n                  \"$\": \"frequent\"\r\n                },\r\n                \"src\": {\r\n                  \"$\": \"Ox.Lat.Dict.\"\r\n                }\r\n              },\r\n              \"mean\": {\r\n                \"$\": \"desire/love/wish/longing (passionate); lust; greed, appetite; desire for gain;\"\r\n              }\r\n            }\r\n          }\r\n        }\r\n      ]\r\n    }\r\n  }\r\n}\r\n";

var Mare = "{\r\n  \"RDF\": {\r\n    \"Annotation\": {\r\n      \"about\": \"urn:TuftsMorphologyService:mare:morpheuslat\",\r\n      \"creator\": {\r\n        \"Agent\": {\r\n          \"about\": \"org.perseus:tools:morpheus.v1\"\r\n        }\r\n      },\r\n      \"created\": {\r\n        \"$\": \"2017-09-08T06:59:48.639180\"\r\n      },\r\n      \"hasTarget\": {\r\n        \"Description\": {\r\n          \"about\": \"urn:word:mare\"\r\n        }\r\n      },\r\n      \"title\": {},\r\n      \"hasBody\": [\r\n        {\r\n          \"resource\": \"urn:uuid:idm140446402389888\"\r\n        },\r\n        {\r\n          \"resource\": \"urn:uuid:idm140446402332400\"\r\n        },\r\n        {\r\n          \"resource\": \"urn:uuid:idm140446402303648\"\r\n        }\r\n      ],\r\n      \"Body\": [\r\n        {\r\n          \"about\": \"urn:uuid:idm140446402389888\",\r\n          \"type\": {\r\n            \"resource\": \"cnt:ContentAsXML\"\r\n          },\r\n          \"rest\": {\r\n            \"entry\": {\r\n              \"uri\": \"http://data.perseus.org/collections/urn:cite:perseus:latlexent.lex34070.1\",\r\n              \"dict\": {\r\n                \"hdwd\": {\r\n                  \"lang\": \"lat\",\r\n                  \"$\": \"mare\"\r\n                },\r\n                \"pofs\": {\r\n                  \"order\": 3,\r\n                  \"$\": \"noun\"\r\n                },\r\n                \"decl\": {\r\n                  \"$\": \"3rd\"\r\n                },\r\n                \"gend\": {\r\n                  \"$\": \"neuter\"\r\n                }\r\n              },\r\n              \"infl\": [\r\n                {\r\n                  \"term\": {\r\n                    \"lang\": \"lat\",\r\n                    \"stem\": {\r\n                      \"$\": \"mar\"\r\n                    },\r\n                    \"suff\": {\r\n                      \"$\": \"e\"\r\n                    }\r\n                  },\r\n                  \"pofs\": {\r\n                    \"order\": 3,\r\n                    \"$\": \"noun\"\r\n                  },\r\n                  \"decl\": {\r\n                    \"$\": \"3rd\"\r\n                  },\r\n                  \"case\": {\r\n                    \"order\": 3,\r\n                    \"$\": \"ablative\"\r\n                  },\r\n                  \"gend\": {\r\n                    \"$\": \"neuter\"\r\n                  },\r\n                  \"num\": {\r\n                    \"$\": \"singular\"\r\n                  },\r\n                  \"stemtype\": {\r\n                    \"$\": \"is_is\"\r\n                  }\r\n                },\r\n                {\r\n                  \"term\": {\r\n                    \"lang\": \"lat\",\r\n                    \"stem\": {\r\n                      \"$\": \"mar\"\r\n                    },\r\n                    \"suff\": {\r\n                      \"$\": \"e\"\r\n                    }\r\n                  },\r\n                  \"pofs\": {\r\n                    \"order\": 3,\r\n                    \"$\": \"noun\"\r\n                  },\r\n                  \"decl\": {\r\n                    \"$\": \"3rd\"\r\n                  },\r\n                  \"case\": {\r\n                    \"order\": 7,\r\n                    \"$\": \"nominative\"\r\n                  },\r\n                  \"gend\": {\r\n                    \"$\": \"neuter\"\r\n                  },\r\n                  \"num\": {\r\n                    \"$\": \"singular\"\r\n                  },\r\n                  \"stemtype\": {\r\n                    \"$\": \"is_is\"\r\n                  }\r\n                },\r\n                {\r\n                  \"term\": {\r\n                    \"lang\": \"lat\",\r\n                    \"stem\": {\r\n                      \"$\": \"mar\"\r\n                    },\r\n                    \"suff\": {\r\n                      \"$\": \"e\"\r\n                    }\r\n                  },\r\n                  \"pofs\": {\r\n                    \"order\": 3,\r\n                    \"$\": \"noun\"\r\n                  },\r\n                  \"decl\": {\r\n                    \"$\": \"3rd\"\r\n                  },\r\n                  \"case\": {\r\n                    \"order\": 1,\r\n                    \"$\": \"vocative\"\r\n                  },\r\n                  \"gend\": {\r\n                    \"$\": \"neuter\"\r\n                  },\r\n                  \"num\": {\r\n                    \"$\": \"singular\"\r\n                  },\r\n                  \"stemtype\": {\r\n                    \"$\": \"is_is\"\r\n                  }\r\n                },\r\n                {\r\n                  \"term\": {\r\n                    \"lang\": \"lat\",\r\n                    \"stem\": {\r\n                      \"$\": \"mar\"\r\n                    },\r\n                    \"suff\": {\r\n                      \"$\": \"e\"\r\n                    }\r\n                  },\r\n                  \"pofs\": {\r\n                    \"order\": 3,\r\n                    \"$\": \"noun\"\r\n                  },\r\n                  \"decl\": {\r\n                    \"$\": \"3rd\"\r\n                  },\r\n                  \"case\": {\r\n                    \"order\": 4,\r\n                    \"$\": \"accusative\"\r\n                  },\r\n                  \"gend\": {\r\n                    \"$\": \"neuter\"\r\n                  },\r\n                  \"num\": {\r\n                    \"$\": \"singular\"\r\n                  },\r\n                  \"stemtype\": {\r\n                    \"$\": \"is_is\"\r\n                  }\r\n                }\r\n              ],\r\n              \"mean\": {\r\n                \"$\": \"the sea\"\r\n              }\r\n            }\r\n          }\r\n        },\r\n        {\r\n          \"about\": \"urn:uuid:idm140446402332400\",\r\n          \"type\": {\r\n            \"resource\": \"cnt:ContentAsXML\"\r\n          },\r\n          \"rest\": {\r\n            \"entry\": {\r\n              \"uri\": \"http://data.perseus.org/collections/urn:cite:perseus:latlexent.lex34118.1\",\r\n              \"dict\": {\r\n                \"hdwd\": {\r\n                  \"lang\": \"lat\",\r\n                  \"$\": \"marum\"\r\n                },\r\n                \"pofs\": {\r\n                  \"order\": 3,\r\n                  \"$\": \"noun\"\r\n                },\r\n                \"decl\": {\r\n                  \"$\": \"2nd\"\r\n                },\r\n                \"gend\": {\r\n                  \"$\": \"neuter\"\r\n                }\r\n              },\r\n              \"infl\": {\r\n                \"term\": {\r\n                  \"lang\": \"lat\",\r\n                  \"stem\": {\r\n                    \"$\": \"mar\"\r\n                  },\r\n                  \"suff\": {\r\n                    \"$\": \"e\"\r\n                  }\r\n                },\r\n                \"pofs\": {\r\n                  \"order\": 3,\r\n                  \"$\": \"noun\"\r\n                },\r\n                \"decl\": {\r\n                  \"$\": \"2nd\"\r\n                },\r\n                \"case\": {\r\n                  \"order\": 1,\r\n                  \"$\": \"vocative\"\r\n                },\r\n                \"gend\": {\r\n                  \"$\": \"neuter\"\r\n                },\r\n                \"num\": {\r\n                  \"$\": \"singular\"\r\n                },\r\n                \"stemtype\": {\r\n                  \"$\": \"us_i\"\r\n                }\r\n              }\r\n            }\r\n          }\r\n        },\r\n        {\r\n          \"about\": \"urn:uuid:idm140446402303648\",\r\n          \"type\": {\r\n            \"resource\": \"cnt:ContentAsXML\"\r\n          },\r\n          \"rest\": {\r\n            \"entry\": {\r\n              \"uri\": \"http://data.perseus.org/collections/urn:cite:perseus:latlexent.lex34119.1\",\r\n              \"dict\": {\r\n                \"hdwd\": {\r\n                  \"lang\": \"lat\",\r\n                  \"$\": \"mas\"\r\n                },\r\n                \"pofs\": {\r\n                  \"order\": 2,\r\n                  \"$\": \"adjective\"\r\n                },\r\n                \"decl\": {\r\n                  \"$\": \"3rd\"\r\n                }\r\n              },\r\n              \"infl\": [\r\n                {\r\n                  \"term\": {\r\n                    \"lang\": \"lat\",\r\n                    \"stem\": {\r\n                      \"$\": \"mare\"\r\n                    }\r\n                  },\r\n                  \"pofs\": {\r\n                    \"order\": 2,\r\n                    \"$\": \"adjective\"\r\n                  },\r\n                  \"decl\": {\r\n                    \"$\": \"3rd\"\r\n                  },\r\n                  \"case\": {\r\n                    \"order\": 3,\r\n                    \"$\": \"ablative\"\r\n                  },\r\n                  \"gend\": {\r\n                    \"$\": \"masculine\"\r\n                  },\r\n                  \"num\": {\r\n                    \"$\": \"singular\"\r\n                  },\r\n                  \"stemtype\": {\r\n                    \"$\": \"irreg_adj3\"\r\n                  },\r\n                  \"morph\": {\r\n                    \"$\": \"indeclform\"\r\n                  }\r\n                },\r\n                {\r\n                  \"term\": {\r\n                    \"lang\": \"lat\",\r\n                    \"stem\": {\r\n                      \"$\": \"mare\"\r\n                    }\r\n                  },\r\n                  \"pofs\": {\r\n                    \"order\": 2,\r\n                    \"$\": \"adjective\"\r\n                  },\r\n                  \"decl\": {\r\n                    \"$\": \"3rd\"\r\n                  },\r\n                  \"case\": {\r\n                    \"order\": 3,\r\n                    \"$\": \"ablative\"\r\n                  },\r\n                  \"gend\": {\r\n                    \"$\": \"feminine\"\r\n                  },\r\n                  \"num\": {\r\n                    \"$\": \"singular\"\r\n                  },\r\n                  \"stemtype\": {\r\n                    \"$\": \"irreg_adj3\"\r\n                  },\r\n                  \"morph\": {\r\n                    \"$\": \"indeclform\"\r\n                  }\r\n                },\r\n                {\r\n                  \"term\": {\r\n                    \"lang\": \"lat\",\r\n                    \"stem\": {\r\n                      \"$\": \"mare\"\r\n                    }\r\n                  },\r\n                  \"pofs\": {\r\n                    \"order\": 2,\r\n                    \"$\": \"adjective\"\r\n                  },\r\n                  \"decl\": {\r\n                    \"$\": \"3rd\"\r\n                  },\r\n                  \"case\": {\r\n                    \"order\": 3,\r\n                    \"$\": \"ablative\"\r\n                  },\r\n                  \"gend\": {\r\n                    \"$\": \"neuter\"\r\n                  },\r\n                  \"num\": {\r\n                    \"$\": \"singular\"\r\n                  },\r\n                  \"stemtype\": {\r\n                    \"$\": \"irreg_adj3\"\r\n                  },\r\n                  \"morph\": {\r\n                    \"$\": \"indeclform\"\r\n                  }\r\n                }\r\n              ]\r\n            }\r\n          }\r\n        }\r\n      ]\r\n    }\r\n  }\r\n}\r\n";

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

var DefaultConfig = "{\r\n  \"engine\": {\r\n    \"lat\": [\"whitakerLat\"],\r\n    \"grc\": [\"morpheusgrc\"],\r\n    \"ara\": [\"aramorph\"]\r\n  },\r\n  \"url\": \"http://morph.alpheios.net/api/v1/analysis/word?word=r_WORD&engine=r_ENGINE&lang=r_LANG\"\r\n}\r\n";

class TuftsAdapter extends BaseAdapter {
  /**
   * A Morph Client Adapter for the Tufts Morphology Service
   * @constructor
   * @param {object} engine an object which maps language code to desired engine code
                            for that language. E.g. { lat : whitakerLat, grc: morpheusgrc }
   */
  constructor (config = null) {
    super();
    if (config == null) {
      try {
        this.config = JSON.parse(DefaultConfig);
      } catch (e) {
        this.config = DefaultConfig;
      }
    } else {
      this.config = config;
    }
    this.engineMap = new Map(([ data, data$1, data$2 ]).map((e) => { return [ e.engine, e ] }));
  }

  getEngineLanguageMap (lang) {
    if (this.config.engine[lang]) {
      return this.engineMap.get(this.config.engine[lang][0])
    } else {
      return null
    }
  }

  prepareRequestUrl (lang, word) {
    let engine = this.getEngineLanguageMap(lang);
    if (engine) {
      let code = engine.engine;
      return this.config.url.replace('r_WORD', word).replace('r_ENGINE', code).replace('r_LANG', lang)
    } else {
      return null
    }
  }

  fetchTestData (lang, word) {
    return new Promise((resolve, reject) => {
      try {
        let wordData = new WordTestData().get(word);
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
    let provider;
    for (let lexeme of annotationBody) {
            // Get importer based on the language
      let language = lexeme.rest.entry.dict.hdwd.lang;
      let mappingData = this.getEngineLanguageMap(language);
      let lemma = mappingData.parseLemma(lexeme.rest.entry.dict.hdwd.$, language);

      if (!provider) {
        let providerUri = jsonObj.RDF.Annotation.about;
        let providerRights = '';
        if (jsonObj.RDF.Annotation.rights) {
          providerRights = jsonObj.RDF.Annotation.rights.$;
        }
        provider = new ResourceProvider(providerUri, providerRights);
      }
      let meaning = lexeme.rest.entry.mean;
      let shortdef;
      if (meaning) {
        // TODO: convert a source-specific language code to ISO 639-3 if don't match
        let lang = meaning.lang ? meaning.lang : 'eng';
        shortdef = new Definition(meaning.$, lang, 'text/plain');
      }
      let inflections = [];
      let inflectionsJSON = lexeme.rest.entry.infl;
      if (!Array.isArray(inflectionsJSON)) {
                // If only one inflection returned, it is a single object, not an array of objects. Convert it to an array for uniformity.
        inflectionsJSON = [inflectionsJSON];
      }
      for (let inflectionJSON of inflectionsJSON) {
        let inflection = new Inflection(inflectionJSON.term.stem.$, mappingData.language.toCode());
        if (inflectionJSON.term.suff) {
                    // Set suffix if provided by a morphological analyzer
          inflection.suffix = inflectionJSON.term.suff.$;
        }

        if (inflectionJSON.xmpl) {
          inflection.example = inflectionJSON.xmpl.$;
        }
                // Parse whatever grammatical features we're interested in
        if (inflectionJSON.pofs) {
          inflection.feature = mappingData[Feature.types.part].get(inflectionJSON.pofs.$);
        }

        if (inflectionJSON.case) {
          inflection.feature = mappingData[Feature.types.grmCase].get(inflectionJSON.case.$);
        }

        if (inflectionJSON.decl) {
          inflection.feature = mappingData[Feature.types.declension].get(inflectionJSON.decl.$);
        }

        if (inflectionJSON.num) {
          inflection.feature = mappingData[Feature.types.number].get(inflectionJSON.num.$);
        }

        if (inflectionJSON.gend) {
          inflection.feature = mappingData[Feature.types.gender].get(inflectionJSON.gend.$);
        }

        if (inflectionJSON.conj) {
          inflection.feature = mappingData[Feature.types.conjugation].get(inflectionJSON.conj.$);
        }

        if (inflectionJSON.tense) {
          inflection.feature = mappingData[Feature.types.tense].get(inflectionJSON.tense.$);
        }

        if (inflectionJSON.voice) {
          inflection.feature = mappingData[Feature.types.voice].get(inflectionJSON.voice.$);
        }

        if (inflectionJSON.mood) {
          inflection.feature = mappingData[Feature.types.mood].get(inflectionJSON.mood.$);
        }

        if (inflectionJSON.pers) {
          inflection.feature = mappingData[Feature.types.person].get(inflectionJSON.pers.$);
        }

        inflections.push(inflection);
      }

      let lexmodel = new Lexeme(lemma, inflections);
      lexmodel.meaning.appendShortDefs(shortdef);
      let providedLexeme = ResourceProvider.getProxy(provider, lexmodel);
      lexemes.push(providedLexeme);
    }
    return new Homonym(lexemes, targetWord)
  }

  async getHomonym (lang, word) {
    let jsonObj = await this.fetch(lang, word);
    if (jsonObj) {
      let homonym = this.transform(jsonObj, word);
      return homonym
    } else {
        // No data found for this word
      return undefined
    }
  }
}

export default TuftsAdapter;
