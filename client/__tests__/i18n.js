const VUE_I18N_OPTION = '__i18n'

module.exports = {
  process({ blocks, vueOptionsNamespace }) {
    const codes = blocks
      .filter(b => b.type === 'i18n')
      .map(block => {
        const value = JSON.stringify(JSON.parse(block.content))
          .replace(/\u2028/g, '\\u2028')
          .replace(/\u2029/g, '\\u2029')
          .replace(/\\/g, '\\\\')
          .replace(/\u0027/g, '\\u0027')
        return `'${value}'`
      })

    return codes.length
      ? `${vueOptionsNamespace}.${VUE_I18N_OPTION} = [\n${codes.join(',\n')}\n]`
      : ''
  },
}
