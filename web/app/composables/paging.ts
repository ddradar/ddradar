/**
 * Use paging feature.
 * @param countPerPage Data count per page
 * @param source Data source
 */
export const usePaging = <T>(
  countPerPage: MaybeRef<number>,
  source: MaybeRef<T[]>
) => {
  const page = ref(1)
  const _pageCount = toRef(countPerPage)
  const _data = toRef(source)
  /** Total data count */
  const total = computed(() => _data.value.length)
  const from = computed(() => (page.value - 1) * _pageCount.value + 1)
  const to = computed(() =>
    Math.min(page.value * _pageCount.value, total.value)
  )
  const data = computed(() => _data.value.slice(from.value - 1, to.value))
  return {
    /** Current Page */
    page,
    /** Data count per page */
    total,
    /** Page data from */
    from,
    /** Page data to */
    to,
    /** Page sliced data */
    data,
  }
}
