const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')

function convert(source, lang) {
  switch (lang) {
    case 'yaml':
    case 'yml':
      return JSON.stringify(yaml.safeLoad(source), undefined, '\t')
    default:
      return source
  }
}

// Because the vue-i18n docs do not require a language
// we have to try to parse the content as json first, then fall back to yaml
function parseLanguageAndContent(block, filename) {
  const langKnown = block.attrs && block.attrs.lang
  let content = block.content

  if (block.attrs && block.attrs.src) {
    content = fs.readFileSync(path.resolve(filename, '../', block.attrs.src))
  }

  if (langKnown) {
    return JSON.stringify(JSON.parse(convert(content, langKnown)))
  }

  try {
    return JSON.stringify(JSON.parse(convert(content, 'json')))
  } catch {
    return JSON.stringify(JSON.parse(convert(content, 'yaml')))
  }
}

module.exports = {
  process({ blocks, vueOptionsNamespace, filename }) {
    const i18nOption = `${vueOptionsNamespace}.__i18n`
    const base = `${i18nOption} = []`
    const codes = blocks
      .filter(b => b.type === 'i18n')
      .map(b => {
        const value = parseLanguageAndContent(b, filename)
          .replace(/\u2028/g, '\\u2028')
          .replace(/\u2029/g, '\\u2029')
          .replace(/\\/g, '\\\\')
          .replace(/\u0027/g, '\\u0027')
        return `${i18nOption}.push('${value}')`
      })
    return codes.length ? [base, ...codes].join('\n') : ''
  },
}
