import * as iconv from 'iconv-lite'

/**
 * Convert master_music to {id - skillAttackId} mapper.
 * @param buffer master_music.txt (Shift JIS, LF)
 */
export function masterMusicToMap(buffer: Buffer): Map<string, number> {
  const text = iconv.decode(buffer, 'shift_jis')
  return new Map(
    text
      .trim()
      .split('\n')
      .map(s => {
        const elements = s.split('\t')
        return [elements[1], parseInt(elements[0], 10)] // id, skillAttackId
      })
  )
}
