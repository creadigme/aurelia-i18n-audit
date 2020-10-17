[![npm version](https://img.shields.io/npm/v/@creadigme/au-i18n-audit.svg)](https://www.npmjs.com/package/creadigme/au-i18n-audit)
[![Downloads](https://img.shields.io/npm/dm/@creadigme/au-i18n-audit.svg)](https://www.npmjs.com/package/creadigme/au-i18n-audit)
[![Build Status](https://github.com/creadigme/au-i18n-audit/workflows/Node.js%20CI/badge.svg)](https://github.com/creadigme/au-i18n-audit/actions)
<br />

# Aurelia I18N Audit

Aurelia I18N Audit bring more control over your translations. With the integrate CLI you can check if all your translations keys is used, more importantly, you will be able to find the ones that are not defined.


## Installation

```shell
npm i @creadigme/au-i18n-audit --save-dev
```

## CLI parameters
  
| Parameter | Description | Sample | Mandatory | Multiple
|---|---|---|---|---|
| --src | Sources directory | `./src/` | true | true
| --i18n | i18n files directory | `./i18n/` | true | true
| --reporter | Reporter : `summary`, `text`, `csv`, `xls` (`npm i exceljs@^4 --save-dev` mandatory) | `summary` | false | true
| --output | Directory or file path of report : only used with reporter `csv` and  `xlsx` | `./i18n_report/` | false | false
| --level | Figure out if we finish with 0 code error or 1 (see Level bellow) | false | false
| --lang | Language | `en` | false | true
| --namespace | Namespace | `cart` | false | true
| --namespace-sep | NS separator (default `:`) | `$` | false | false
| --nested-sep | Sub key separator (default `.`) | `~` | false | false
| --ignore-keys | Provide the ability to ignore specific keys | `^(shop|other)\\.` | false | false
| --discovery | Provide the ability to discover i18n keys everywhere (you must provide `--namespace` & `--lang`) | | false | false

| Level | Description 
|---|---|
| `0` | Easy: just have all languages ok
| **`1`** | Medium: no missing keys & all languages ok (default)
| `2` | Hard: no missing keys && no unused keys & all languages ok

## Usage

| Directory |  |  |  |  |
|---|---|---|---|---|
| `./samples` | `/case_01` | `/i18n` | `/fr` | `/EASY.yml`
|  |  | `/src` | `/sample.html` | 
|  |  | | `/sample.ts` | 


```json
"scripts": {
  "i18n" : "node au-i18n-audit --src ./src/ --i18n ./i18n --reporter summary"
}
```

```shell
npm run i18n
# [i18n] @creadigme/au-i18n-audit v0.8.0.
# [i18n] 2 languages detected (en, fr).
# [i18n] 132 keys seems not to be used (maybe server side ?).
# [i18n] 21 keys are not defined.
# [i18n] 1 keys do not have all the languages translated.
```

### API

```typescript
import { I18NAudit } from '@creadigme/au-i18n-audit';

async () => {
  const audit = new I18NAudit({
    srcPaths : [path.resolve(".\\samples\\case_01\\src")],
    local : {
      i18nPaths : [path.resolve(".\\samples\\case_01\\i18n")]
    }
  });

  await audit.initializeAsync();
  const details = await audit.validateAsync();

  console.log(details.isOk);
}();
```
