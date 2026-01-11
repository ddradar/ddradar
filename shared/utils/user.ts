/**
 * Get My Groove Radar title from Groove Radar values.
 * @param radar Groove Radar values
 * @returns My Groove Radar title (ex. "激流の足神")
 */
export function getMyGrooveRadarTitle(radar: Readonly<GrooveRadar>): string {
  const titles: [number, string][] = [
    [198, '真・足神さま'],
    [180, '大足神'],
    [160, '足神'],
    [140, '足紙さま？'],
    [120, '足鳳凰'],
    [100, '足龍'],
    [85, '足皇帝'],
    [70, '足王'],
    [55, '足将軍'],
    [40, '足貴族'],
    [30, '足騎士'],
    [20, '足侍'],
    [10, '足戦士'],
    [1, '足はじめ'],
  ]

  for (const [i, [border, title]] of titles.entries()) {
    const minRadarValue = Math.min(
      radar.stream,
      radar.voltage,
      radar.air,
      radar.freeze,
      radar.chaos
    )
    if (minRadarValue >= border) return `${getPrefix(radar, i)}${title}`
  }
  return '？？？'

  function getPrefix(radar: Readonly<GrooveRadar>, titleIndex: number): string {
    const beyond = titles[titleIndex - 1]?.[0]
    if (beyond === undefined) return ''
    const maxRadarValue = Math.max(
      radar.stream,
      radar.voltage,
      radar.air,
      radar.freeze,
      radar.chaos
    )
    if (maxRadarValue < beyond) return ''
    if (radar.stream === maxRadarValue) return '激流の'
    if (radar.voltage === maxRadarValue) return '爆炎の'
    if (radar.air === maxRadarValue) return '大空の'
    if (radar.freeze === maxRadarValue) return '氷点の'
    return '混沌の'
  }
}

/**
 * Add Groove Radar values to each other for My Groove Radar calculation.
 * @param existing Existing Groove Radar values
 * @param addition Groove Radar values to add
 * @returns Combined Groove Radar values
 */
export function addToMyGrooveRadar(
  existing: Readonly<GrooveRadar>,
  addition: Readonly<GrooveRadar>
): GrooveRadar {
  const merged: GrooveRadar = {
    stream: Math.max(existing.stream, addition.stream),
    voltage: Math.max(existing.voltage, addition.voltage),
    air: Math.max(existing.air, addition.air),
    freeze: Math.max(existing.freeze, addition.freeze),
    chaos: Math.max(existing.chaos, addition.chaos),
  }
  // Unless you reach 足龍 (All 100), each value cannot exceed 100.
  const hasReachedAshiryu =
    Math.min(
      merged.stream,
      merged.voltage,
      merged.air,
      merged.freeze,
      merged.chaos
    ) >= 100
  return {
    stream: hasReachedAshiryu ? merged.stream : Math.min(merged.stream, 100),
    voltage: hasReachedAshiryu ? merged.voltage : Math.min(merged.voltage, 100),
    air: hasReachedAshiryu ? merged.air : Math.min(merged.air, 100),
    freeze: hasReachedAshiryu ? merged.freeze : Math.min(merged.freeze, 100),
    chaos: hasReachedAshiryu ? merged.chaos : Math.min(merged.chaos, 100),
  }
}

/**
 * Get total FLARE skill rank title from total FLARE skill points.
 * @param totalFlareSkill Total FLARE skill points
 * @returns Total FLARE skill rank title (ex. "SUN++")
 */
export function getTotalFlareSkillRank(totalFlareSkill: number): string {
  const ranks: [number, string][] = [
    [90000, 'WORLD'],
    [86250, 'SUN+++'],
    [82500, 'SUN++'],
    [78750, 'SUN+'],
    [75000, 'SUN'],
    [71520, 'NEPTUNE+++'],
    [67500, 'NEPTUNE++'],
    [63750, 'NEPTUNE+'],
    [60000, 'NEPTUNE'],
    [56250, 'URANUS+++'],
    [52500, 'URANUS++'],
    [48750, 'URANUS+'],
    [45000, 'URANUS'],
    [42250, 'SATURN+++'],
    [39500, 'SATURN++'],
    [36750, 'SATURN+'],
    [34000, 'SATURN'],
    [31500, 'JUPITER+++'],
    [29000, 'JUPITER++'],
    [26500, 'JUPITER+'],
    [24000, 'JUPITER'],
    [22000, 'MARS+++'],
    [20000, 'MARS++'],
    [18000, 'MARS+'],
    [16000, 'MARS'],
    [14500, 'EARTH+++'],
    [13000, 'EARTH++'],
    [11500, 'EARTH+'],
    [10000, 'EARTH'],
    [9000, 'VENUS+++'],
    [8000, 'VENUS++'],
    [7000, 'VENUS+'],
    [6000, 'VENUS'],
    [5000, 'MERCURY+++'],
    [4000, 'MERCURY++'],
    [3000, 'MERCURY+'],
    [2000, 'MERCURY'],
    [1500, 'NONE+++'],
    [1000, 'NONE++'],
    [500, 'NONE+'],
  ]
  for (const [border, rank] of ranks) if (totalFlareSkill >= border) return rank
  return 'NONE'
}
