import ImportData from '../lib'
import * as Models from 'alpheios-data-models'

let data = new ImportData(new Models.GreekLanguageModel())
let types = Models.Feature.types

/*
Below are value conversion maps for each grammatical feature to be parsed.
Format:
data.addFeature(typeName).add(providerValueName, LibValueName);
(functions are chainable)
Types and values that are unknown (undefined) will be skipped during parsing.
 */

data.addFeature(Models.Feature.types.gender).importer
    .map('masculine feminine',
  [ data.language.features[types.gender][Models.Constants.GEND_MASCULINE],
    data.language.features[types.gender][Models.Constants.GEND_FEMININE]
  ])

export default data
