import TuftsLatinData from './lang/latin';
import * as Models from 'alpheios-data-models';
import WordTestData from '../../tests/data/test-data';

class TuftsAdapter {
    constructor() {
      let latin_code = TuftsLatinData.language.toCode();
      this[latin_code] = TuftsLatinData;
      //this[Lib.languages.greek] = TuftsGreekData;
      //this.langMap = new Map([['lat', TuftsLatinData]]);
      //this.langMap = new Lib.Importer().map('lat', Lib.languages.latin).map('grc', Lib.languages.greek);
      this.langMap = new Models.FeatureImporter().map('lat', latin_code);
      return this;
    }

    // Not implemented yet
    fetch(lang, word) {
    }

    fetchTestData(lang, word) {
        return new Promise((resolve, reject) => {
            try {
                let wordData = new WordTestData().get(word);
                console.log(wordData);
                let json = JSON.parse(wordData);
                resolve(json);
            }
            catch (error) {
                // Word is not found in test data
                reject(error);
            }
        });
    }

    /**
     * A function that maps a morphological service's specific data types and values into an inflection library standard.
     * @param {object} jsonObj - A JSON data from a Morphological Analyzer.
     * @returns {Homonym} A library standard Homonym object.
     */
    transform (jsonObj) {
        "use strict";
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
            let lemma = new Models.Lemma(lexeme.rest.entry.dict.hdwd.$, language);

            let inflections = [];
            let inflectionsJSON = lexeme.rest.entry.infl;
            if (!Array.isArray(inflectionsJSON)) {
                // If only one inflection returned, it is a single object, not an array of objects. Convert it to an array for uniformity.
                inflectionsJSON = [inflectionsJSON];
            }
            for (let inflectionJSON of inflectionsJSON) {
                let inflection = new Models.Inflection(inflectionJSON.term.stem.$, this[language].language);
                if (inflectionJSON.term.suff) {
                    // Set suffix if provided by a morphological analyzer
                    inflection.suffix = inflectionJSON.term.suff.$;
                }

                // Parse whatever grammatical features we're interested in
                if (inflectionJSON.pofs) {
                    inflection.feature = this[language][Models.Feature.types.part].get(inflectionJSON.pofs.$);
                }

                if (inflectionJSON.case) {
                    inflection.feature = this[language][Models.Feature.types.grmCase].get(inflectionJSON.case.$);
                }

                if (inflectionJSON.decl) {
                    inflection.feature = this[language][Models.Feature.types.declension].get(inflectionJSON.decl.$);
                }

                if (inflectionJSON.num) {
                    inflection.feature = this[language][Models.Feature.types.number].get(inflectionJSON.num.$);
                }

                if (inflectionJSON.gend) {
                    inflection.feature = this[language][Models.Feature.types.gender].get(inflectionJSON.gend.$);
                }

                if (inflectionJSON.conj) {
                    inflection.feature = this[language][Models.Feature.types.conjugation].get(inflectionJSON.conj.$);
                }

                if (inflectionJSON.tense) {
                    inflection.feature = this[language][Models.Feature.types.tense].get(inflectionJSON.tense.$);
                }

                if (inflectionJSON.voice) {
                    inflection.feature = this[language][Models.Feature.types.voice].get(inflectionJSON.voice.$);
                }

                if (inflectionJSON.mood) {
                    inflection.feature = this[language][Models.Feature.types.mood].get(inflectionJSON.mood.$);
                }

                if (inflectionJSON.pers) {
                    inflection.feature = this[language][Models.Feature.types.person].get(inflectionJSON.pers.$);
                }

                inflections.push(inflection);
            }
            lexemes.push(new Models.Lexeme(lemma, inflections));
        }
        return new Models.Homonym(lexemes);
    }
}

export default TuftsAdapter;
