import ImportData from "../../lib/lib";
import * as Models from 'alpheios-data-models'

let data = new ImportData(new Models.LatinLanguageModel());
let types = Models.Feature.types;

/*
Below are value conversion maps for each grammatical feature to be parsed.
Format:
data.addFeature(typeName).add(providerValueName, LibValueName);
(functions are chainable)
Types and values that are unknown (undefined) will be skipped during parsing.
 */
data.addFeature(Models.Feature.types.part).importer
    .map('noun', data.language.features[types.part].noun)
    .map('adjective', data.language.features[types.part].adjective)
    .map('verb', data.language.features[types.part].verb);

data.addFeature(Models.Feature.types.grmCase).importer
    .map('nominative', data.language.features[types.grmCase].nominative)
    .map('genitive', data.language.features[types.grmCase].genitive)
    .map('dative', data.language.features[types.grmCase].dative)
    .map('accusative', data.language.features[types.grmCase].accusative)
    .map('ablative', data.language.features[types.grmCase].ablative)
    .map('locative', data.language.features[types.grmCase].locative)
    .map('vocative', data.language.features[types.grmCase].vocative);

data.addFeature(Models.Feature.types.declension).importer
    .map('1st', data.language.features[types.declension].first)
    .map('2nd', data.language.features[types.declension].second)
    .map('3rd', data.language.features[types.declension].third)
    .map('4th', data.language.features[types.declension].fourth)
    .map('5th', data.language.features[types.declension].fifth);

data.addFeature(Models.Feature.types.number).importer
    .map('singular', data.language.features[types.number].singular)
    .map('plural', data.language.features[types.number].plural);

data.addFeature(Models.Feature.types.gender).importer
    .map('masculine', data.language.features[types.gender].masculine)
    .map('feminine', data.language.features[types.gender].feminine)
    .map('neuter', data.language.features[types.gender].neuter)
    .map('common', [data.language.features[types.gender].masculine, data.language.features[types.gender].feminine])
    .map('all', [data.language.features[types.gender].masculine, data.language.features[types.gender].feminine, data.language.features[types.gender].neuter]);

data.addFeature(Models.Feature.types.conjugation).importer
    .map('1st', data.language.features[types.conjugation].first)
    .map('2nd', data.language.features[types.conjugation].second)
    .map('3rd', data.language.features[types.conjugation].third)
    .map('4th', data.language.features[types.conjugation].fourth);

data.addFeature(Models.Feature.types.tense).importer
    .map('present', data.language.features[types.tense].present)
    .map('imperfect', data.language.features[types.tense].imperfect)
    .map('future', data.language.features[types.tense].future)
    .map('perfect', data.language.features[types.tense].perfect)
    .map('pluperfect', data.language.features[types.tense].pluperfect)
    .map('future_perfect', data.language.features[types.tense]['future perfect']);

data.addFeature(Models.Feature.types.voice).importer
    .map('active', data.language.features[types.voice].active)
    .map('passive', data.language.features[types.voice].passive);

data.addFeature(Models.Feature.types.mood).importer
    .map('indicative', data.language.features[types.mood].indicative)
    .map('subjunctive', data.language.features[types.mood].subjunctive);

data.addFeature(Models.Feature.types.person).importer
    .map('1st', data.language.features[types.person].first)
    .map('2nd', data.language.features[types.person].second)
    .map('3rd', data.language.features[types.person].third);

export default data;
