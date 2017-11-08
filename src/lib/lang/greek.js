import ImportData from '../lib'
import * as Models from 'alpheios-data-models'

let data = new ImportData(new Models.data.language.GreekLanguageModel())
let types = Models.Feature.types

/*
Below are value conversion maps for each grammatical feature to be parsed.
Format:
data.addFeature(typeName).add(providerValueName, LibValueName);
(functions are chainable)
Types and values that are unknown (undefined) will be skipped during parsing.
 */
data.addFeature(Models.Feature.types.part).importer
    .map('noun', data.language.features.parts.noun)

data.addFeature(Models.Feature.types.grmCase).importer
    .map('nominative', data.language.features[types.case].nominative)
    .map('genitive', data.language.features[types.case].genitive)
    .map('dative', data.language.features[types.case].dative)
    .map('accusative', data.language.features[types.case].accusative)
    .map('vocative', data.language.features[types.case].vocative)

data.addFeature(Models.Feature.types.declension).importer
    .map('1st', data.language.features[types.declension].first)
    .map('2nd', data.language.features[types.declension].second)
    .map('3rd', data.language.features[types.declension].third)

data.addFeature(Models.Feature.types.number).importer
    .map('singular', data.language.features[types.number].singular)
    .map('dual', data.language.features[types.number].dual)
    .map('plural', data.language.features[types.number].plural)

data.addFeature(Models.Feature.types.gender).importer
    .map('masculine', data.language.features[types.gender].masculine)
    .map('feminine', data.language.features[types.gender].feminine)
    .map('neuter', data.language.features[types.gender].neuter)
    .map('masculine feminine', [data.language.features[types.gender].masculine, data.language.features[types.gender].feminine])

export default data
