import ImportData from '../lib'
import * as Models from 'alpheios-data-models'

let data = new ImportData(new Models.PersianLanguageModel(), 'hazm')
let types = Models.Feature.types

data.addFeature(Models.Feature.types.part).importer
    .map('proper noun', [data.language.features[types.part][Models.Constants.POFS_NOUN]])

export default data
