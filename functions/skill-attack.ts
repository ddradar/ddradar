import { decode } from 'iconv-lite'

/**
 * Convert master_music to {id - skillAttackId} mapper.
 * @param buffer master_music.txt (Shift JIS)
 */
export function masterMusicToMap(buffer: Buffer): Map<string, string> {
  const text = decode(buffer, 'shift_jis')
  return new Map(
    text.split('\r').map(s => {
      const elements = s.split('\t')
      return [elements[1], elements[0]] // id, skillAttackId
    })
  )
}
