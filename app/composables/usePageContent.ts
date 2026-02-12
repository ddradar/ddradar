export default function (path: MaybeRef<string>) {
  const { locale } = useI18n()

  return useAsyncData(
    'page-' + unref(path),
    async () => {
      // Build collection name based on current locale
      const collection = `content_${locale.value}` as const
      const content = await queryCollection(collection)
        .path(unref(path))
        .first()

      // Optional: fallback to default locale if content is missing
      if (!content && locale.value !== 'en')
        return await queryCollection('content_en').path(unref(path)).first()

      return content
    },
    { watch: [locale] }
  )
}
