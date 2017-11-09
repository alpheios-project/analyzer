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
data.addFeature(Models.Feature.types.declension).importer
    .map('1st', data.language.features[types.declension].first)
    .map('2nd', data.language.features[types.declension].second)
    .map('3rd', data.language.features[types.declension].third)

data.addFeature(Models.Feature.types.person).importer
    .map('1st', data.language.features[types.person].first)
    .map('2nd', data.language.features[types.person].second)
    .map('3rd', data.language.features[types.person].third)

data.addFeature(Models.Feature.types.gender).importer
    .map('masculine feminine', [data.language.features[types.gender].masculine, data.language.features[types.gender].feminine])

export default data
