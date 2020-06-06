import {
  hasNumberProperty,
  hasProperty,
  hasStringProperty,
} from './type-assert'

export type Song = {
  /** ^[01689bdiloqDIOPQ]{32}$ */
  id: string
  name: string
  /** name furigana ^([A-Z0-9 .ぁ-んー]*)$ */
  nameKana: string
  nameIndex: SongIndex
  artist: string
  series: string
  /** Displayed min BPM (Beet Per Minutes). */
  minBPM: number | null
  /** Displayed max BPM (Beet Per Minutes). */
  maxBPM: number | null
}

export const isSong = (obj: unknown): obj is Song =>
  hasStringProperty(obj, 'id', 'name', 'nameKana', 'artist', 'series') &&
  /^[01689bdiloqDIOPQ]{32}$/.test(obj.id) &&
  /^([A-Z0-9 .ぁ-んー]*)$/.test(obj.nameKana) &&
  hasNumberProperty(obj, 'nameIndex') &&
  Number.isInteger(obj.nameIndex) &&
  obj.nameIndex >= 0 &&
  obj.nameIndex <= 36 &&
  hasProperty(obj, 'minBPM') &&
  (typeof obj.minBPM === 'number' || obj.minBPM === null) &&
  hasProperty(obj, 'maxBPM') &&
  (typeof obj.maxBPM === 'number' || obj.maxBPM === null)

type Series =
  | 'DDR 1st'
  | 'DDR 2ndMIX'
  | 'DDR 3rdMIX'
  | 'DDR 4thMIX'
  | 'DDR 5thMIX'
  | 'DDRMAX'
  | 'DDRMAX2'
  | 'DDR EXTREME'
  | 'DDR SuperNOVA'
  | 'DDR SuperNOVA2'
  | 'DDR X'
  | 'DDR X2'
  | 'DDR X3 VS 2ndMIX'
  | 'DanceDanceRevolution (2013)'
  | 'DanceDanceRevolution (2014)'
  | 'DanceDanceRevolution A'
  | 'DanceDanceRevolution A20'

export const SeriesList: Series[] = [
  'DDR 1st',
  'DDR 2ndMIX',
  'DDR 3rdMIX',
  'DDR 4thMIX',
  'DDR 5thMIX',
  'DDRMAX',
  'DDRMAX2',
  'DDR EXTREME',
  'DDR SuperNOVA',
  'DDR SuperNOVA2',
  'DDR X',
  'DDR X2',
  'DDR X3 VS 2ndMIX',
  'DanceDanceRevolution (2013)',
  'DanceDanceRevolution (2014)',
  'DanceDanceRevolution A',
  'DanceDanceRevolution A20',
]

type SongIndex =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31
  | 32
  | 33
  | 34
  | 35
  | 36

export const SongNameIndex: string[] = [
  'あ',
  'か',
  'さ',
  'た',
  'な',
  'は',
  'ま',
  'や',
  'ら',
  'わ',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
  '数字・記号',
]
