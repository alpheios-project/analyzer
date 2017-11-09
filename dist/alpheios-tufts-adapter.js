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

const LANG_UNIT_WORD = Symbol('word');

const LANG_DIR_LTR = Symbol('ltr');

const LANG_LATIN = Symbol('latin');
const LANG_GREEK = Symbol('greek');
const STR_LANG_CODE_LAT = 'lat';
const STR_LANG_CODE_LA = 'la';
const STR_LANG_CODE_GRC = 'grc';

/**
 * @class  LanguageModel is the base class for language-specific behavior
 */
class LanguageModel {
   /**
   */
  constructor () {
    this.sourceLanguage = null;
    this.contextForward = 0;
    this.context_backward = 0;
    this.direction = LANG_DIR_LTR;
    this.baseUnit = LANG_UNIT_WORD;
    this.codes = [];
    this.features = {}; // Grammatical feature types (definitions) within supported by a specific language.
  }

  /**
   * Handler which can be used as the contextHander.
   * It uses language-specific configuration to identify
   * the elements from the alph-text popup which should produce links
   * to the language-specific grammar.
   * @see #contextHandler
   */
  grammarContext (doc) {
      // used to bind a click handler on the .alph-entry items in the
      // popup which retrieved the context attribute from the clicked
      // term and used that to construct a link and open the grammar
      // at the apporopriate place.
      // var links = this.getGrammarLinks();

      // for (var link_name in links)
      // {
      //   if (links.hasOwnProperty(link_name))
      //    {
              // Alph.$(".alph-entry ." + link_name,a_doc).bind('click',link_name,
              //   function(a_e)
              //    {
                        // build target inside grammar
                        // var target = a_e.data;
                        // var rngContext = Alph.$(this).attr("context");
                        // if (rngContext != null)
                        // {
                        //  target += "-" + rngContext.split(/-/)[0];
                        // }
                        // myobj.openGrammar(a_e.originaEvent,this,target);
               //   }
              // );
       //   }
      // }
  }

  /**
   * Check to see if this language tool can produce an inflection table display
   * for the current node
   */
  canInflect (node) {
    return false
  }

  /**
   * Check to see if the supplied language code is supported by this tool
   * @param {string} code the language code
   * @returns true if supported false if not
   * @type Boolean
   */
  static supportsLanguage (code) {
    return this.codes.includes[code]
  }

  /**
   * Return a normalized version of a word which can be used to compare the word for equality
   * @param {string} word the source word
   * @returns the normalized form of the word (default version just returns the same word,
   *          override in language-specific subclass)
   * @type String
   */
  normalizeWord (word) {
    return word
  }

  /**
   * Get a list of valid puncutation for this language
   * @returns {String} a string containing valid puncutation symbols
   */
  getPunctuation () {
    return ".,;:!?'\"(){}\\[\\]<>/\\\u00A0\u2010\u2011\u2012\u2013\u2014\u2015\u2018\u2019\u201C\u201D\u0387\u00B7\n\r"
  }

  toString () {
    return String(this.sourceLanguage)
  }

  isEqual (model) {
    return this.sourceLanguage === model.sourceLanguage
  }

  toCode () {
    return null
  }
}

/**
 * Wrapper class for a (grammatical, usually) feature, such as part of speech or declension. Keeps both value and type information.
 */
class Feature {
    /**
     * Initializes a Feature object
     * @param {string | string[]} value - A single feature value or, if this feature could have multiple
     * values, an array of values.
     * @param {string} type - A type of the feature, allowed values are specified in 'types' object.
     * @param {string} language - A language of a feature, allowed values are specified in 'languages' object.
     */
  constructor (value, type, language) {
    if (!Feature.types.isAllowed(type)) {
      throw new Error('Features of "' + type + '" type are not supported.')
    }
    if (!value) {
      throw new Error('Feature should have a non-empty value.')
    }
    if (!type) {
      throw new Error('Feature should have a non-empty type.')
    }
    if (!language) {
      throw new Error('Feature constructor requires a language')
    }
    this.value = value;
    this.type = type;
    this.language = language;
  };

  isEqual (feature) {
    if (Array.isArray(feature.value)) {
      if (!Array.isArray(this.value) || this.value.length !== feature.value.length) {
        return false
      }
      let equal = this.type === feature.type && this.language === feature.language;
      equal = equal && this.value.every(function (element, index) {
        return element === feature.value[index]
      });
      return equal
    } else {
      return this.value === feature.value && this.type === feature.type && this.language === feature.language
    }
  }
}
// Should have no spaces in values in order to be used in HTML templates
Feature.types = {
  word: 'word',
  part: 'part of speech', // Part of speech
  number: 'number',
  grmCase: 'case',
  declension: 'declension',
  gender: 'gender',
  type: 'type',
  conjugation: 'conjugation',
  tense: 'tense',
  voice: 'voice',
  mood: 'mood',
  person: 'person',
  frequency: 'frequency', // How frequent this word is
  meaning: 'meaning', // Meaning of a word
  source: 'source', // Source of word definition
  footnote: 'footnote', // A footnote for a word's ending
  dialect: 'dialect',
  isAllowed (value) {
    let v = `${value}`;
    return Object.values(this).includes(v)
  }
};

/**
 * Definition class for a (grammatical) feature. Stores type information and (optionally) all possible values of the feature.
 * It serves as a feature generator. If list of possible values is provided, it can generate a Feature object
 * each time a property that corresponds to a feature value is accessed. If no list of possible values provided,
 * a Feature object can be generated with get(value) method.
 *
 * An order of values determines a default sort and grouping order. If two values should have the same order,
 * they should be grouped within an array: value1, [value2, value3], value4. Here 'value2' and 'value3' have
 * the same priority for sorting and grouping.
 */
class FeatureType {
    // TODO: value checking
    /**
     * Creates and initializes a Feature Type object.
     * @param {string} type - A type of the feature, allowed values are specified in 'types' object.
     * @param {string[] | string[][]} values - A list of allowed values for this feature type.
     * If an empty array is provided, there will be no
     * allowed values as well as no ordering (can be used for items that do not need or have a simple order,
     * such as footnotes).
     * @param {string} language - A language of a feature, allowed values are specified in 'languages' object.
     */
  constructor (type, values, language) {
    if (!Feature.types.isAllowed(type)) {
      throw new Error('Features of "' + type + '" type are not supported.')
    }
    if (!values || !Array.isArray(values)) {
      throw new Error('Values should be an array (or an empty array) of values.')
    }
    if (!language) {
      throw new Error('FeatureType constructor requires a language')
    }

    this.type = type;
    this.language = language;

        /*
         This is a sort order index for a grammatical feature values. It is determined by the order of values in
         a 'values' array.
         */
    this._orderIndex = [];
    this._orderLookup = {};

    for (const [index, value] of values.entries()) {
      this._orderIndex.push(value);
      if (Array.isArray(value)) {
        for (let element of value) {
          this[element] = new Feature(element, this.type, this.language);
          this._orderLookup[element] = index;
        }
      } else {
        this[value] = new Feature(value, this.type, this.language);
        this._orderLookup[value] = index;
      }
    }
  };

    /**
     * Return a Feature with an arbitrary value. This value would not be necessarily present among FeatureType values.
     * This can be especially useful for features that do not set: a list of predefined values, such as footnotes.
     * @param value
     * @returns {Feature}
     */
  get (value) {
    if (value) {
      return new Feature(value, this.type, this.language)
    } else {
      throw new Error('A non-empty value should be provided.')
    }
  }

    /**
     * Creates and returns a new importer with a specific name. If an importer with this name already exists,
     * an existing Importer object will be returned.
     * @param {string} name - A name of an importer object
     * @returns {Importer} A new or existing Importer object that matches a name provided
     */
  addImporter (name) {
    if (!name) {
      throw new Error('Importer should have a non-empty name.')
    }
    this.importer = this.importer || {};
    this.importer[name] = this.importer[name] || new Importer();
    return this.importer[name]
  }

    /**
     * Return copies of all feature values as Feature objects in a sorted array, according to feature type's sort order.
     * For a similar function that returns strings instead of Feature objects see orderedValues().
     * @returns {Feature[] | Feature[][]} Array of feature values sorted according to orderIndex.
     * If particular feature contains multiple feature values (i.e. `masculine` and `feminine` values combined),
     * an array of Feature objects will be returned instead of a single Feature object, as for single feature values.
     */
  get orderedFeatures () {
    return this.orderedValues.map((value) => new Feature(value, this.type, this.language))
  }

    /**
     * Return all feature values as strings in a sorted array, according to feature type's sort order.
     * This is a main method that specifies a sort order of the feature type. orderedFeatures() relies
     * on this method in providing a sorted array of feature values. If you want to create
     * a custom sort order for a particular feature type that will depend on some options that are not type-related,
     * create a wrapper around this function providing it with options arguments so it will be able to decide
     * in what order those features will be based on those arguments.
     * For a similar function that returns Feature objects instead of strings see orderedValues().
     * @returns {string[]} Array of feature values sorted according to orderIndex.
     * If particular feature contains multiple feature values (i.e. `masculine` and `feminine` values combined),
     * an array of strings will be returned instead of a single strings, as for single feature values.
     */
  get orderedValues () {
    return this._orderIndex
  }

    /**
     * Returns a lookup table for type values as:
     *  {value1: order1, value2: order2}, where order is a sort order of an item. If two items have the same sort order,
     *  their order value will be the same.
     * @returns {object}
     */
  get orderLookup () {
    return this._orderLookup
  }

    /**
     * Sets an order of grammatical feature values for a grammatical feature. Used mostly for sorting, filtering,
     * and displaying.
     *
     * @param {Feature[] | Feature[][]} values - a list of grammatical features that specify their order for
     * sorting and filtering. Some features can be grouped as [[genders.masculine, genders.feminine], LibLatin.genders.neuter].
     * It means that genders.masculine and genders.feminine belong to the same group. They will have the same index
     * and will be stored inside an _orderIndex as an array. genders.masculine and genders.feminine will be grouped together
     * during filtering and will be in the same bin during sorting.
     *
     */
  set order (values) {
    if (!values || (Array.isArray(values) && values.length === 0)) {
      throw new Error('A non-empty list of values should be provided.')
    }

        // If a single value is provided, convert it into an array
    if (!Array.isArray(values)) {
      values = [values];
    }

    for (let value of values) {
      if (Array.isArray(value)) {
        for (let element of value) {
          if (!this.hasOwnProperty(element.value)) {
            throw new Error('Trying to order an element with "' + element.value + '" value that is not stored in a "' + this.type + '" type.')
          }

          if (element.type !== this.type) {
            throw new Error('Trying to order an element with type "' + element.type + '" that is different from "' + this.type + '".')
          }

          if (element.language !== this.language) {
            throw new Error('Trying to order an element with language "' + element.language + '" that is different from "' + this.language + '".')
          }
        }
      } else {
        if (!this.hasOwnProperty(value.value)) {
          throw new Error('Trying to order an element with "' + value.value + '" value that is not stored in a "' + this.type + '" type.')
        }

        if (value.type !== this.type) {
          throw new Error('Trying to order an element with type "' + value.type + '" that is different from "' + this.type + '".')
        }

        if (value.language !== this.language) {
          throw new Error('Trying to order an element with language "' + value.language + '" that is different from "' + this.language + '".')
        }
      }
    }

        // Erase whatever sort order was set previously
    this._orderLookup = {};
    this._orderIndex = [];

        // Define a new sort order
    for (const [index, element] of values.entries()) {
      if (Array.isArray(element)) {
                // If it is an array, all values should have the same order
        let elements = [];
        for (const subElement of element) {
          this._orderLookup[subElement.value] = index;
          elements.push(subElement.value);
        }
        this._orderIndex[index] = elements;
      } else {
                // If is a single value
        this._orderLookup[element.value] = index;
        this._orderIndex[index] = element.value;
      }
    }
  }
}

/**
 * This is a hash table that maps values to be imported from an external file or service to library standard values.
 */
class Importer {
  constructor () {
    this.hash = {};
    return this
  }

    /**
     * Sets mapping between external imported value and one or more library standard values. If an importedValue
     * is already in a hash table, old libraryValue will be overwritten with the new one.
     * @param {string} importedValue - External value
     * @param {Object | Object[] | string | string[]} libraryValue - Library standard value
     */
  map (importedValue, libraryValue) {
    if (!importedValue) {
      throw new Error('Imported value should not be empty.')
    }

    if (!libraryValue) {
      throw new Error('Library value should not be empty.')
    }

    this.hash[importedValue] = libraryValue;
    return this
  }

    /**
     * Checks if value is in a map.
     * @param {string} importedValue - A value to test.
     * @returns {boolean} - Tru if value is in a map, false otherwise.
     */
  has (importedValue) {
    return this.hash.hasOwnProperty(importedValue)
  }

    /**
     * Returns one or more library standard values that match an external value
     * @param {string} importedValue - External value
     * @returns {Object | string} One or more of library standard values
     */
  get (importedValue) {
    if (this.has(importedValue)) {
      return this.hash[importedValue]
    } else {
      throw new Error('A value "' + importedValue + '" is not found in the importer.')
    }
  }
}

/**
 * @class  LatinLanguageModel is the lass for Latin specific behavior
 */
class LatinLanguageModel extends LanguageModel {
   /**
   */
  constructor () {
    super();
    this.sourceLanguage = LANG_LATIN;
    this.contextForward = 0;
    this.contextBackward = 0;
    this.direction = LANG_DIR_LTR;
    this.baseUnit = LANG_UNIT_WORD;
    this.codes = [STR_LANG_CODE_LA, STR_LANG_CODE_LAT];
    this.features = this._initializeFeatures();
  }

  _initializeFeatures () {
    let features = {};
    let code = this.toCode();
    features[Feature.types.part] = new FeatureType(Feature.types.part, ['noun', 'adjective', 'verb'], code);
    features[Feature.types.number] = new FeatureType(Feature.types.number, ['singular', 'plural'], code);
    features[Feature.types.grmCase] = new FeatureType(Feature.types.grmCase, ['nominative', 'genitive', 'dative', 'accusative', 'ablative', 'locative', 'vocative'], code);
    features[Feature.types.declension] = new FeatureType(Feature.types.declension, ['first', 'second', 'third', 'fourth', 'fifth'], code);
    features[Feature.types.gender] = new FeatureType(Feature.types.gender, ['masculine', 'feminine', 'neuter'], code);
    features[Feature.types.type] = new FeatureType(Feature.types.type, ['regular', 'irregular'], code);
    features[Feature.types.tense] = new FeatureType(Feature.types.tense, ['present', 'imperfect', 'future', 'perfect', 'pluperfect', 'future perfect'], code);
    features[Feature.types.voice] = new FeatureType(Feature.types.voice, ['passive', 'active'], code);
    features[Feature.types.mood] = new FeatureType(Feature.types.mood, ['indicative', 'subjunctive'], code);
    features[Feature.types.person] = new FeatureType(Feature.types.person, ['first', 'second', 'third'], code);
    features[Feature.types.conjugation] = new FeatureType(Feature.types.conjugation, ['first', 'second', 'third', 'fourth'], code);
    return features
  }

  /**
   * Check to see if this language tool can produce an inflection table display
   * for the current node
   */
  canInflect (node) {
    return true
  }

  /**
   * Return a normalized version of a word which can be used to compare the word for equality
   * @param {String} word the source word
   * @returns the normalized form of the word (default version just returns the same word,
   *          override in language-specific subclass)
   * @type String
   */
  normalizeWord (word) {
    return word
  }

  /**
   * Get a list of valid puncutation for this language
   * @returns {String} a string containing valid puncutation symbols
   */
  getPunctuation () {
    return ".,;:!?'\"(){}\\[\\]<>/\\\u00A0\u2010\u2011\u2012\u2013\u2014\u2015\u2018\u2019\u201C\u201D\u0387\u00B7\n\r"
  }

  toCode () {
    return STR_LANG_CODE_LAT
  }
}

/**
 * @class  LatinLanguageModel is the lass for Latin specific behavior
 */
class GreekLanguageModel extends LanguageModel {
   /**
   * @constructor
   */
  constructor () {
    super();
    this.sourceLanguage = LANG_GREEK;
    this.contextForward = 0;
    this.contextBackward = 0;
    this.direction = LANG_DIR_LTR;
    this.baseUnit = LANG_UNIT_WORD;
    this.languageCodes = [STR_LANG_CODE_GRC];
    this.features = this._initializeFeatures();
  }

  _initializeFeatures () {
    let features = {};
    let code = this.toCode();
    features[Feature.types.part] = new FeatureType(Feature.types.part, ['noun', 'adjective', 'verb', 'pronoun', 'article', 'numeral', 'conjunction', 'preoposition', 'interjection'], code);
    features[Feature.types.number] = new FeatureType(Feature.types.number, ['singular', 'plural', 'dual'], code);
    features[Feature.types.grmCase] = new FeatureType(Feature.types.grmCase, ['nominative', 'genitive', 'dative', 'accusative', 'vocative'], code);
    features[Feature.types.declension] = new FeatureType(Feature.types.declension, ['first', 'second', 'third'], code);
    features[Feature.types.gender] = new FeatureType(Feature.types.gender, ['masculine', 'feminine', 'neuter'], code);
    features[Feature.types.type] = new FeatureType(Feature.types.type, ['regular', 'irregular'], code);
    features[Feature.types.tense] = new FeatureType(Feature.types.tense, ['present', 'future', 'perfect', 'pluperfect', 'future perfect', 'aorist'], code);
    features[Feature.types.voice] = new FeatureType(Feature.types.voice, ['passive', 'active', 'mediopassive', 'middle'], code);
    features[Feature.types.mood] = new FeatureType(Feature.types.mood, ['indicative', 'subjunctive', 'optative', 'imperative'], code);
    features[Feature.types.person] = new FeatureType(Feature.types.person, ['first', 'second', 'third'], code);
    features[Feature.types.dialect] = new FeatureType(Feature.types.dialect, ['attic', 'epic', 'doric'], code);
    return features
  }

  toCode () {
    return STR_LANG_CODE_GRC
  }

  /**
   * Check to see if this language tool can produce an inflection table display
   * for the current node
   */
  canInflect (node) {
    return true
  }

  /**
   * Return a normalized version of a word which can be used to compare the word for equality
   * @param {String} word the source word
   * @returns the normalized form of the word (default version just returns the same word,
   *          override in language-specific subclass)
   * @type String
   */
  normalizeWord (word) {
    return word
  }

  /**
   * Get a list of valid puncutation for this language
   * @returns {String} a string containing valid puncutation symbols
   */
  getPunctuation () {
    return ".,;:!?'\"(){}\\[\\]<>/\\\u00A0\u2010\u2011\u2012\u2013\u2014\u2015\u2018\u2019\u201C\u201D\u0387\u00B7\n\r"
  }
}

/**
 * A list of grammatical features that characterizes a language unit. Has some additional service methods,
 * compared with standard storage objects.
 */

class FeatureImporter {
  constructor () {
    this.hash = {};
    return this
  }

    /**
     * Sets mapping between external imported value and one or more library standard values. If an importedValue
     * is already in a hash table, old libraryValue will be overwritten with the new one.
     * @param {string} importedValue - External value
     * @param {Object | Object[] | string | string[]} libraryValue - Library standard value
     */
  map (importedValue, libraryValue) {
    if (!importedValue) {
      throw new Error('Imported value should not be empty.')
    }

    if (!libraryValue) {
      throw new Error('Library value should not be empty.')
    }

    this.hash[importedValue] = libraryValue;
    return this
  }

    /**
     * Checks if value is in a map.
     * @param {string} importedValue - A value to test.
     * @returns {boolean} - Tru if value is in a map, false otherwise.
     */
  has (importedValue) {
    return this.hash.hasOwnProperty(importedValue)
  }

    /**
     * Returns one or more library standard values that match an external value
     * @param {string} importedValue - External value
     * @returns {Object | string} One or more of library standard values
     */
  get (importedValue) {
    if (this.has(importedValue)) {
      return this.hash[importedValue]
    } else {
      throw new Error('A value "' + importedValue + '" is not found in the importer.')
    }
  }
}

/**
 * Lemma, a canonical form of a word.
 */
class Lemma {
    /**
     * Initializes a Lemma object.
     * @param {string} word - A word.
     * @param {string} language - A language of a word.
     */
  constructor (word, language) {
    if (!word) {
      throw new Error('Word should not be empty.')
    }

    if (!language) {
      throw new Error('Langauge should not be empty.')
    }

        // if (!languages.isAllowed(language)) {
        //    throw new Error('Language "' + language + '" is not supported.');
        // }

    this.word = word;
    this.language = language;
  }

  static readObject (jsonObject) {
    return new Lemma(jsonObject.word, jsonObject.language)
  }
}

/*
 Hierarchical structure of return value of a morphological analyzer:

 Homonym (a group of words that are written the same way, https://en.wikipedia.org/wiki/Homonym)
    Lexeme 1 (a unit of lexical meaning, https://en.wikipedia.org/wiki/Lexeme)
        Have a lemma and one or more inflections
        Lemma (also called a headword, a canonical form of a group of words https://en.wikipedia.org/wiki/Lemma_(morphology) )
        Inflection 1
            Stem
            Suffix (also called ending)
        Inflection 2
            Stem
            Suffix
    Lexeme 2
        Lemma
        Inflection 1
            Stem
            Suffix
 */

/**
 * Represents an inflection of a word
 */
class Inflection {
    /**
     * Initializes an Inflection object.
     * @param {string} stem - A stem of a word.
     * @param {string} language - A word's language.
     */
  constructor (stem, language) {
    if (!stem) {
      throw new Error('Stem should not be empty.')
    }

    if (!language) {
      throw new Error('Langauge should not be empty.')
    }

    this.stem = stem;
    this.language = language;

        // Suffix may not be present in every word. If missing, it will set to null.
    this.suffix = null;
  }

  static readObject (jsonObject) {
    let inflection = new Inflection(jsonObject.stem, jsonObject.language);
    if (jsonObject.suffix) {
      inflection.suffix = jsonObject.suffix;
    }
    return inflection
  }

    /**
     * Sets a grammatical feature in an inflection. Some features can have multiple values, In this case
     * an array of Feature objects will be provided.
     * Values are taken from features and stored in a 'feature.type' property as an array of values.
     * @param {Feature | Feature[]} data
     */
  set feature (data) {
    if (!data) {
      throw new Error('Inflection feature data cannot be empty.')
    }
    if (!Array.isArray(data)) {
      data = [data];
    }

    let type = data[0].type;
    this[type] = [];
    for (let element of data) {
      if (!(element instanceof Feature)) {
        throw new Error('Inflection feature data must be a Feature object.')
      }

      if (element.language !== this.language) {
        throw new Error('Language "' + element.language + '" of a feature does not match a language "' +
                this.language + '" of an Inflection object.')
      }

      this[type].push(element.value);
    }
  }
}

/**
 * A basic unit of lexical meaning. Contains a Lemma object and one or more Inflection objects.
 */
class Lexeme {
    /**
     * Initializes a Lexeme object.
     * @param {Lemma} lemma - A lemma object.
     * @param {Inflection[]} inflections - An array of inflections.
     * @param {string} meaning - a short definition
     */
  constructor (lemma, inflections, meaning = '') {
    if (!lemma) {
      throw new Error('Lemma should not be empty.')
    }

    if (!(lemma instanceof Lemma)) {
      throw new Error('Lemma should be of Lemma object type.')
    }

    if (!inflections) {
      throw new Error('Inflections data should not be empty.')
    }

    if (!Array.isArray(inflections)) {
      throw new Error('Inflection data should be provided in an array.')
    }

    for (let inflection of inflections) {
      if (!(inflection instanceof Inflection)) {
        throw new Error('All inflection data should be of Inflection object type.')
      }
    }

    this.lemma = lemma;
    this.inflections = inflections;
    this.meaning = meaning;
  }

  static readObject (jsonObject) {
    let lemma = Lemma.readObject(jsonObject.lemma);
    let inflections = [];
    for (let inflection of jsonObject.inflections) {
      inflections.push(Inflection.readObject(inflection));
    }
    return new Lexeme(lemma, inflections)
  }
}

class Homonym {
    /**
     * Initializes a Homonym object.
     * @param {Lexeme[]} lexemes - An array of Lexeme objects.
     * @param {string} form - the form which produces the homonyms
     */
  constructor (lexemes, form) {
    if (!lexemes) {
      throw new Error('Lexemes data should not be empty.')
    }

    if (!Array.isArray(lexemes)) {
      throw new Error('Lexeme data should be provided in an array.')
    }

    for (let lexeme of lexemes) {
      if (!(lexeme instanceof Lexeme)) {
        throw new Error('All lexeme data should be of Lexeme object type.')
      }
    }

    this.lexemes = lexemes;
    this.targetWord = form;
  }

  static readObject (jsonObject) {
    let lexemes = [];
    if (jsonObject.lexemes) {
      for (let lexeme of jsonObject.lexemes) {
        lexemes.push(Lexeme.readObject(lexeme));
      }
    }
    let homonym = new Homonym(lexemes);
    if (jsonObject.targetWord) {
      homonym.targetWord = jsonObject.targetWord;
    }
    return homonym
  }

    /**
     * Returns language of a homonym.
     * Homonym does not have a language property, only lemmas and inflections do. We assume that all lemmas
     * and inflections within the same homonym will have the same language, and we can determine a language
     * by using language property of the first lemma. We chan change this logic in the future if we'll need to.
     * @returns {string} A language code, as defined in the `languages` object.
     */
  get language () {
    if (this.lexemes && this.lexemes[0] && this.lexemes[0].lemma && this.lexemes[0].lemma.language) {
      return this.lexemes[0].lemma.language
    } else {
      throw new Error('Homonym has not been initialized properly. Unable to obtain language information.')
    }
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
    // add all the features that the language supports so that we
    // can return the default values if we don't need to import a mapping
    for (let featureName of Object.keys(language.features)) {
      this.addFeature(featureName);
    }
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

let data$1 = new ImportData(new GreekLanguageModel());
let types$1 = Feature.types;

/*
Below are value conversion maps for each grammatical feature to be parsed.
Format:
data.addFeature(typeName).add(providerValueName, LibValueName);
(functions are chainable)
Types and values that are unknown (undefined) will be skipped during parsing.
 */
data$1.addFeature(Feature.types.declension).importer
    .map('1st', data$1.language.features[types$1.declension].first)
    .map('2nd', data$1.language.features[types$1.declension].second)
    .map('3rd', data$1.language.features[types$1.declension].third);

data$1.addFeature(Feature.types.gender).importer
    .map('masculine feminine', [data$1.language.features[types$1.gender].masculine, data$1.language.features[types$1.gender].feminine]);

var Cupidinibus = "{\n  \"RDF\": {\n    \"Annotation\": {\n      \"about\": \"urn:TuftsMorphologyService:cupidinibus:whitakerLat\",\n      \"creator\": {\n        \"Agent\": {\n          \"about\": \"net.alpheios:tools:wordsxml.v1\"\n        }\n      },\n      \"created\": {\n        \"$\": \"2017-08-10T23:15:29.185581\"\n      },\n      \"hasTarget\": {\n        \"Description\": {\n          \"about\": \"urn:word:cupidinibus\"\n        }\n      },\n      \"title\": {},\n      \"hasBody\": [\n        {\n          \"resource\": \"urn:uuid:idm140578094883136\"\n        },\n        {\n          \"resource\": \"urn:uuid:idm140578158026160\"\n        }\n      ],\n      \"Body\": [\n        {\n          \"about\": \"urn:uuid:idm140578094883136\",\n          \"type\": {\n            \"resource\": \"cnt:ContentAsXML\"\n          },\n          \"rest\": {\n            \"entry\": {\n              \"infl\": [\n                {\n                  \"term\": {\n                    \"lang\": \"lat\",\n                    \"stem\": {\n                      \"$\": \"cupidin\"\n                    },\n                    \"suff\": {\n                      \"$\": \"ibus\"\n                    }\n                  },\n                  \"pofs\": {\n                    \"order\": 5,\n                    \"$\": \"noun\"\n                  },\n                  \"decl\": {\n                    \"$\": \"3rd\"\n                  },\n                  \"var\": {\n                    \"$\": \"1st\"\n                  },\n                  \"case\": {\n                    \"order\": 2,\n                    \"$\": \"locative\"\n                  },\n                  \"num\": {\n                    \"$\": \"plural\"\n                  },\n                  \"gend\": {\n                    \"$\": \"masculine\"\n                  }\n                },\n                {\n                  \"term\": {\n                    \"lang\": \"lat\",\n                    \"stem\": {\n                      \"$\": \"cupidin\"\n                    },\n                    \"suff\": {\n                      \"$\": \"ibus\"\n                    }\n                  },\n                  \"pofs\": {\n                    \"order\": 5,\n                    \"$\": \"noun\"\n                  },\n                  \"decl\": {\n                    \"$\": \"3rd\"\n                  },\n                  \"var\": {\n                    \"$\": \"1st\"\n                  },\n                  \"case\": {\n                    \"order\": 5,\n                    \"$\": \"dative\"\n                  },\n                  \"num\": {\n                    \"$\": \"plural\"\n                  },\n                  \"gend\": {\n                    \"$\": \"masculine\"\n                  }\n                },\n                {\n                  \"term\": {\n                    \"lang\": \"lat\",\n                    \"stem\": {\n                      \"$\": \"cupidin\"\n                    },\n                    \"suff\": {\n                      \"$\": \"ibus\"\n                    }\n                  },\n                  \"pofs\": {\n                    \"order\": 5,\n                    \"$\": \"noun\"\n                  },\n                  \"decl\": {\n                    \"$\": \"3rd\"\n                  },\n                  \"var\": {\n                    \"$\": \"1st\"\n                  },\n                  \"case\": {\n                    \"order\": 3,\n                    \"$\": \"ablative\"\n                  },\n                  \"num\": {\n                    \"$\": \"plural\"\n                  },\n                  \"gend\": {\n                    \"$\": \"masculine\"\n                  }\n                }\n              ],\n              \"dict\": {\n                \"hdwd\": {\n                  \"lang\": \"lat\",\n                  \"$\": \"Cupido, Cupidinis\"\n                },\n                \"pofs\": {\n                  \"order\": 5,\n                  \"$\": \"noun\"\n                },\n                \"decl\": {\n                  \"$\": \"3rd\"\n                },\n                \"gend\": {\n                  \"$\": \"masculine\"\n                },\n                \"area\": {\n                  \"$\": \"religion\"\n                },\n                \"freq\": {\n                  \"order\": 4,\n                  \"$\": \"common\"\n                },\n                \"src\": {\n                  \"$\": \"Ox.Lat.Dict.\"\n                }\n              },\n              \"mean\": {\n                \"$\": \"Cupid, son of Venus; personification of carnal desire;\"\n              }\n            }\n          }\n        },\n        {\n          \"about\": \"urn:uuid:idm140578158026160\",\n          \"type\": {\n            \"resource\": \"cnt:ContentAsXML\"\n          },\n          \"rest\": {\n            \"entry\": {\n              \"infl\": [\n                {\n                  \"term\": {\n                    \"lang\": \"lat\",\n                    \"stem\": {\n                      \"$\": \"cupidin\"\n                    },\n                    \"suff\": {\n                      \"$\": \"ibus\"\n                    }\n                  },\n                  \"pofs\": {\n                    \"order\": 5,\n                    \"$\": \"noun\"\n                  },\n                  \"decl\": {\n                    \"$\": \"3rd\"\n                  },\n                  \"var\": {\n                    \"$\": \"1st\"\n                  },\n                  \"case\": {\n                    \"order\": 2,\n                    \"$\": \"locative\"\n                  },\n                  \"num\": {\n                    \"$\": \"plural\"\n                  },\n                  \"gend\": {\n                    \"$\": \"common\"\n                  }\n                },\n                {\n                  \"term\": {\n                    \"lang\": \"lat\",\n                    \"stem\": {\n                      \"$\": \"cupidin\"\n                    },\n                    \"suff\": {\n                      \"$\": \"ibus\"\n                    }\n                  },\n                  \"pofs\": {\n                    \"order\": 5,\n                    \"$\": \"noun\"\n                  },\n                  \"decl\": {\n                    \"$\": \"3rd\"\n                  },\n                  \"var\": {\n                    \"$\": \"1st\"\n                  },\n                  \"case\": {\n                    \"order\": 5,\n                    \"$\": \"dative\"\n                  },\n                  \"num\": {\n                    \"$\": \"plural\"\n                  },\n                  \"gend\": {\n                    \"$\": \"common\"\n                  }\n                },\n                {\n                  \"term\": {\n                    \"lang\": \"lat\",\n                    \"stem\": {\n                      \"$\": \"cupidin\"\n                    },\n                    \"suff\": {\n                      \"$\": \"ibus\"\n                    }\n                  },\n                  \"pofs\": {\n                    \"order\": 5,\n                    \"$\": \"noun\"\n                  },\n                  \"decl\": {\n                    \"$\": \"3rd\"\n                  },\n                  \"var\": {\n                    \"$\": \"1st\"\n                  },\n                  \"case\": {\n                    \"order\": 3,\n                    \"$\": \"ablative\"\n                  },\n                  \"num\": {\n                    \"$\": \"plural\"\n                  },\n                  \"gend\": {\n                    \"$\": \"common\"\n                  }\n                }\n              ],\n              \"dict\": {\n                \"hdwd\": {\n                  \"lang\": \"lat\",\n                  \"$\": \"cupido, cupidinis\"\n                },\n                \"pofs\": {\n                  \"order\": 5,\n                  \"$\": \"noun\"\n                },\n                \"decl\": {\n                  \"$\": \"3rd\"\n                },\n                \"gend\": {\n                  \"$\": \"common\"\n                },\n                \"freq\": {\n                  \"order\": 5,\n                  \"$\": \"frequent\"\n                },\n                \"src\": {\n                  \"$\": \"Ox.Lat.Dict.\"\n                }\n              },\n              \"mean\": {\n                \"$\": \"desire/love/wish/longing (passionate); lust; greed, appetite; desire for gain;\"\n              }\n            }\n          }\n        }\n      ]\n    }\n  }\n}\n";

var Mare = "{\n  \"RDF\": {\n    \"Annotation\": {\n      \"about\": \"urn:TuftsMorphologyService:mare:morpheuslat\",\n      \"creator\": {\n        \"Agent\": {\n          \"about\": \"org.perseus:tools:morpheus.v1\"\n        }\n      },\n      \"created\": {\n        \"$\": \"2017-09-08T06:59:48.639180\"\n      },\n      \"hasTarget\": {\n        \"Description\": {\n          \"about\": \"urn:word:mare\"\n        }\n      },\n      \"title\": {},\n      \"hasBody\": [\n        {\n          \"resource\": \"urn:uuid:idm140446402389888\"\n        },\n        {\n          \"resource\": \"urn:uuid:idm140446402332400\"\n        },\n        {\n          \"resource\": \"urn:uuid:idm140446402303648\"\n        }\n      ],\n      \"Body\": [\n        {\n          \"about\": \"urn:uuid:idm140446402389888\",\n          \"type\": {\n            \"resource\": \"cnt:ContentAsXML\"\n          },\n          \"rest\": {\n            \"entry\": {\n              \"uri\": \"http://data.perseus.org/collections/urn:cite:perseus:latlexent.lex34070.1\",\n              \"dict\": {\n                \"hdwd\": {\n                  \"lang\": \"lat\",\n                  \"$\": \"mare\"\n                },\n                \"pofs\": {\n                  \"order\": 3,\n                  \"$\": \"noun\"\n                },\n                \"decl\": {\n                  \"$\": \"3rd\"\n                },\n                \"gend\": {\n                  \"$\": \"neuter\"\n                }\n              },\n              \"infl\": [\n                {\n                  \"term\": {\n                    \"lang\": \"lat\",\n                    \"stem\": {\n                      \"$\": \"mar\"\n                    },\n                    \"suff\": {\n                      \"$\": \"e\"\n                    }\n                  },\n                  \"pofs\": {\n                    \"order\": 3,\n                    \"$\": \"noun\"\n                  },\n                  \"decl\": {\n                    \"$\": \"3rd\"\n                  },\n                  \"case\": {\n                    \"order\": 3,\n                    \"$\": \"ablative\"\n                  },\n                  \"gend\": {\n                    \"$\": \"neuter\"\n                  },\n                  \"num\": {\n                    \"$\": \"singular\"\n                  },\n                  \"stemtype\": {\n                    \"$\": \"is_is\"\n                  }\n                },\n                {\n                  \"term\": {\n                    \"lang\": \"lat\",\n                    \"stem\": {\n                      \"$\": \"mar\"\n                    },\n                    \"suff\": {\n                      \"$\": \"e\"\n                    }\n                  },\n                  \"pofs\": {\n                    \"order\": 3,\n                    \"$\": \"noun\"\n                  },\n                  \"decl\": {\n                    \"$\": \"3rd\"\n                  },\n                  \"case\": {\n                    \"order\": 7,\n                    \"$\": \"nominative\"\n                  },\n                  \"gend\": {\n                    \"$\": \"neuter\"\n                  },\n                  \"num\": {\n                    \"$\": \"singular\"\n                  },\n                  \"stemtype\": {\n                    \"$\": \"is_is\"\n                  }\n                },\n                {\n                  \"term\": {\n                    \"lang\": \"lat\",\n                    \"stem\": {\n                      \"$\": \"mar\"\n                    },\n                    \"suff\": {\n                      \"$\": \"e\"\n                    }\n                  },\n                  \"pofs\": {\n                    \"order\": 3,\n                    \"$\": \"noun\"\n                  },\n                  \"decl\": {\n                    \"$\": \"3rd\"\n                  },\n                  \"case\": {\n                    \"order\": 1,\n                    \"$\": \"vocative\"\n                  },\n                  \"gend\": {\n                    \"$\": \"neuter\"\n                  },\n                  \"num\": {\n                    \"$\": \"singular\"\n                  },\n                  \"stemtype\": {\n                    \"$\": \"is_is\"\n                  }\n                },\n                {\n                  \"term\": {\n                    \"lang\": \"lat\",\n                    \"stem\": {\n                      \"$\": \"mar\"\n                    },\n                    \"suff\": {\n                      \"$\": \"e\"\n                    }\n                  },\n                  \"pofs\": {\n                    \"order\": 3,\n                    \"$\": \"noun\"\n                  },\n                  \"decl\": {\n                    \"$\": \"3rd\"\n                  },\n                  \"case\": {\n                    \"order\": 4,\n                    \"$\": \"accusative\"\n                  },\n                  \"gend\": {\n                    \"$\": \"neuter\"\n                  },\n                  \"num\": {\n                    \"$\": \"singular\"\n                  },\n                  \"stemtype\": {\n                    \"$\": \"is_is\"\n                  }\n                }\n              ]\n            }\n          }\n        },\n        {\n          \"about\": \"urn:uuid:idm140446402332400\",\n          \"type\": {\n            \"resource\": \"cnt:ContentAsXML\"\n          },\n          \"rest\": {\n            \"entry\": {\n              \"uri\": \"http://data.perseus.org/collections/urn:cite:perseus:latlexent.lex34118.1\",\n              \"dict\": {\n                \"hdwd\": {\n                  \"lang\": \"lat\",\n                  \"$\": \"marum\"\n                },\n                \"pofs\": {\n                  \"order\": 3,\n                  \"$\": \"noun\"\n                },\n                \"decl\": {\n                  \"$\": \"2nd\"\n                },\n                \"gend\": {\n                  \"$\": \"neuter\"\n                }\n              },\n              \"infl\": {\n                \"term\": {\n                  \"lang\": \"lat\",\n                  \"stem\": {\n                    \"$\": \"mar\"\n                  },\n                  \"suff\": {\n                    \"$\": \"e\"\n                  }\n                },\n                \"pofs\": {\n                  \"order\": 3,\n                  \"$\": \"noun\"\n                },\n                \"decl\": {\n                  \"$\": \"2nd\"\n                },\n                \"case\": {\n                  \"order\": 1,\n                  \"$\": \"vocative\"\n                },\n                \"gend\": {\n                  \"$\": \"neuter\"\n                },\n                \"num\": {\n                  \"$\": \"singular\"\n                },\n                \"stemtype\": {\n                  \"$\": \"us_i\"\n                }\n              }\n            }\n          }\n        },\n        {\n          \"about\": \"urn:uuid:idm140446402303648\",\n          \"type\": {\n            \"resource\": \"cnt:ContentAsXML\"\n          },\n          \"rest\": {\n            \"entry\": {\n              \"uri\": \"http://data.perseus.org/collections/urn:cite:perseus:latlexent.lex34119.1\",\n              \"dict\": {\n                \"hdwd\": {\n                  \"lang\": \"lat\",\n                  \"$\": \"mas\"\n                },\n                \"pofs\": {\n                  \"order\": 2,\n                  \"$\": \"adjective\"\n                },\n                \"decl\": {\n                  \"$\": \"3rd\"\n                }\n              },\n              \"infl\": [\n                {\n                  \"term\": {\n                    \"lang\": \"lat\",\n                    \"stem\": {\n                      \"$\": \"mare\"\n                    }\n                  },\n                  \"pofs\": {\n                    \"order\": 2,\n                    \"$\": \"adjective\"\n                  },\n                  \"decl\": {\n                    \"$\": \"3rd\"\n                  },\n                  \"case\": {\n                    \"order\": 3,\n                    \"$\": \"ablative\"\n                  },\n                  \"gend\": {\n                    \"$\": \"masculine\"\n                  },\n                  \"num\": {\n                    \"$\": \"singular\"\n                  },\n                  \"stemtype\": {\n                    \"$\": \"irreg_adj3\"\n                  },\n                  \"morph\": {\n                    \"$\": \"indeclform\"\n                  }\n                },\n                {\n                  \"term\": {\n                    \"lang\": \"lat\",\n                    \"stem\": {\n                      \"$\": \"mare\"\n                    }\n                  },\n                  \"pofs\": {\n                    \"order\": 2,\n                    \"$\": \"adjective\"\n                  },\n                  \"decl\": {\n                    \"$\": \"3rd\"\n                  },\n                  \"case\": {\n                    \"order\": 3,\n                    \"$\": \"ablative\"\n                  },\n                  \"gend\": {\n                    \"$\": \"feminine\"\n                  },\n                  \"num\": {\n                    \"$\": \"singular\"\n                  },\n                  \"stemtype\": {\n                    \"$\": \"irreg_adj3\"\n                  },\n                  \"morph\": {\n                    \"$\": \"indeclform\"\n                  }\n                },\n                {\n                  \"term\": {\n                    \"lang\": \"lat\",\n                    \"stem\": {\n                      \"$\": \"mare\"\n                    }\n                  },\n                  \"pofs\": {\n                    \"order\": 2,\n                    \"$\": \"adjective\"\n                  },\n                  \"decl\": {\n                    \"$\": \"3rd\"\n                  },\n                  \"case\": {\n                    \"order\": 3,\n                    \"$\": \"ablative\"\n                  },\n                  \"gend\": {\n                    \"$\": \"neuter\"\n                  },\n                  \"num\": {\n                    \"$\": \"singular\"\n                  },\n                  \"stemtype\": {\n                    \"$\": \"irreg_adj3\"\n                  },\n                  \"morph\": {\n                    \"$\": \"indeclform\"\n                  }\n                }\n              ]\n            }\n          }\n        }\n      ]\n    }\n  }\n}";

var Cepit = "{\n  \"RDF\": {\n    \"Annotation\": {\n      \"about\": \"urn:TuftsMorphologyService:cepit:whitakerLat\",\n      \"creator\": {\n        \"Agent\": {\n          \"about\": \"net.alpheios:tools:wordsxml.v1\"\n        }\n      },\n      \"created\": {\n        \"$\": \"2017-08-10T23:16:53.672068\"\n      },\n      \"hasTarget\": {\n        \"Description\": {\n          \"about\": \"urn:word:cepit\"\n        }\n      },\n      \"title\": {},\n      \"hasBody\": {\n        \"resource\": \"urn:uuid:idm140578133848416\"\n      },\n      \"Body\": {\n        \"about\": \"urn:uuid:idm140578133848416\",\n        \"type\": {\n          \"resource\": \"cnt:ContentAsXML\"\n        },\n        \"rest\": {\n          \"entry\": {\n            \"infl\": {\n              \"term\": {\n                \"lang\": \"lat\",\n                \"stem\": {\n                  \"$\": \"cep\"\n                },\n                \"suff\": {\n                  \"$\": \"it\"\n                }\n              },\n              \"pofs\": {\n                \"order\": 3,\n                \"$\": \"verb\"\n              },\n              \"conj\": {\n                \"$\": \"3rd\"\n              },\n              \"var\": {\n                \"$\": \"1st\"\n              },\n              \"tense\": {\n                \"$\": \"perfect\"\n              },\n              \"voice\": {\n                \"$\": \"active\"\n              },\n              \"mood\": {\n                \"$\": \"indicative\"\n              },\n              \"pers\": {\n                \"$\": \"3rd\"\n              },\n              \"num\": {\n                \"$\": \"singular\"\n              }\n            },\n            \"dict\": {\n              \"hdwd\": {\n                \"lang\": \"lat\",\n                \"$\": \"capio, capere, cepi, captus\"\n              },\n              \"pofs\": {\n                \"order\": 3,\n                \"$\": \"verb\"\n              },\n              \"conj\": {\n                \"$\": \"3rd\"\n              },\n              \"kind\": {\n                \"$\": \"transitive\"\n              },\n              \"freq\": {\n                \"order\": 6,\n                \"$\": \"very frequent\"\n              },\n              \"src\": {\n                \"$\": \"Ox.Lat.Dict.\"\n              }\n            },\n            \"mean\": {\n              \"$\": \"take hold, seize; grasp; take bribe; arrest/capture; put on; occupy; captivate;\"\n            }\n          }\n        }\n      }\n    }\n  }\n}\n";

var Pilsopo = "{\n  \"RDF\": {\n    \"Annotation\": {\n      \"about\": \"urn:TuftsMorphologyService:φιλόσοφος:morpheuslat\",\n      \"creator\": {\n        \"Agent\": {\n          \"about\": \"org.perseus:tools:morpheus.v1\"\n        }\n      },\n      \"created\": {\n        \"$\": \"2017-10-15T14:06:40.522369\"\n      },\n      \"hasTarget\": {\n        \"Description\": {\n          \"about\": \"urn:word:φιλόσοφος\"\n        }\n      },\n      \"title\": {},\n      \"hasBody\": {\n        \"resource\": \"urn:uuid:idm140446394225264\"\n      },\n      \"Body\": {\n        \"about\": \"urn:uuid:idm140446394225264\",\n        \"type\": {\n          \"resource\": \"cnt:ContentAsXML\"\n        },\n        \"rest\": {\n          \"entry\": {\n            \"uri\": \"http://data.perseus.org/collections/urn:cite:perseus:grclexent.lex78378.1\",\n            \"dict\": {\n              \"hdwd\": {\n                \"lang\": \"grc\",\n                \"$\": \"φιλόσοφος\"\n              },\n              \"pofs\": {\n                \"order\": 3,\n                \"$\": \"noun\"\n              },\n              \"decl\": {\n                \"$\": \"2nd\"\n              },\n              \"gend\": {\n                \"$\": \"masculine\"\n              }\n            },\n            \"infl\": {\n              \"term\": {\n                \"lang\": \"grc\",\n                \"stem\": {\n                  \"$\": \"φιλοσοφ\"\n                },\n                \"suff\": {\n                  \"$\": \"ος\"\n                }\n              },\n              \"pofs\": {\n                \"order\": 3,\n                \"$\": \"noun\"\n              },\n              \"decl\": {\n                \"$\": \"2nd\"\n              },\n              \"case\": {\n                \"order\": 7,\n                \"$\": \"nominative\"\n              },\n              \"gend\": {\n                \"$\": \"masculine\"\n              },\n              \"num\": {\n                \"$\": \"singular\"\n              },\n              \"stemtype\": {\n                \"$\": \"os_ou\"\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}";

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
    this['lat'] = data;
    this['grc'] = data$1;
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
      let language = lexeme.rest.entry.dict.hdwd.lang;
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
