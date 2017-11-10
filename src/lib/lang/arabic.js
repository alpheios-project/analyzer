import ImportData from '../lib'
import * as Models from 'alpheios-data-models'

let data = new ImportData(new Models.ArabicLanguageModel())
let types = Models.Feature.types

data.addFeature(Models.Feature.types.gender).importer
    .map('masculine feminine', [data.language.features[types.gender].masculine, data.language.features[types.gender].feminine])
export default data
