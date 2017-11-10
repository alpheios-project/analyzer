import ImportData from '../lib'
import * as Models from 'alpheios-data-models'

let data = new ImportData(new Models.LatinLanguageModel())
let types = Models.Feature.types

/*
Below are value conversion maps for each grammatical feature to be parsed.
Format:
data.addFeature(typeName).add(providerValueName, LibValueName);
(functions are chainable)
Types and values that are unknown (undefined) will be skipped during parsing.
 */

 // TODO  - per inflections.xsd
 // Whitakers Words uses packon and tackon in POFS, not sure how

data.addFeature(Models.Feature.types.gender).importer
    .map('common',
  [ data.language.features[types.gender][Models.Constants.GEND_MASCULINE],
    data.language.features[types.gender][Models.Constants.GEND_FEMININE]
  ])
    .map('all',
  [ data.language.features[types.gender][Models.Constants.GEND_MASCULINE],
    data.language.features[types.gender][Models.Constants.GEND_FEMININE],
    data.language.features[types.gender][Models.Constants.GEND_NEUTER]
  ])

data.addFeature(Models.Feature.types.tense).importer
    .map('future_perfect', data.language.features[types.tense][Models.Constants.TENSE_FUTURE_PERFECT])

export default data
