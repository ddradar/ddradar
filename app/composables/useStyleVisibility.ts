/**
 * Use play style visibility setting.
 * @returns
 * - `0`: Both
 * - `1`: Single only
 * - `2`: Double only
 */
export default function () {
  return useLocalState<StepChart['playStyle'] | 0>(
    'play-style-visibility',
    () => 0
  )
}
