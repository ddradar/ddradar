import type { Series } from './db'

export type {
  Difficulty,
  DifficultyName,
  GrooveRadar,
  NameIndex,
  PlayStyle,
  Series,
} from './db'
/* c8 ignore next */
export {
  difficultyMap,
  getNameIndex,
  isValidId,
  nameIndexMap,
  playStyleMap,
  seriesSet,
} from './db'

type GateSeries = Series & `DanceDanceRevolution A${string}`
/**
 * Returns whether the song has been deleted on the e-amusement GATE site.
 * @param songId Song Id
 * @returns true if deleted at DDR A version.
 */
export function isDeletedOnGate(songId: string): boolean

/**
 * Returns whether the song has been deleted on the e-amusement GATE site.
 * @param songId Song Id
 * @param series e-amusement GATE version
 * @returns true if deleted at provided version.
 */
export function isDeletedOnGate(songId: string, series: GateSeries): boolean

/**
 * Returns whether the song has been deleted on the e-amusement GATE site.
 * @param songId Song Id
 * @param series e-amusement GATE version
 * @returns true if deleted at provided version.
 */
export function isDeletedOnGate(
  songId: string,
  series: GateSeries = 'DanceDanceRevolution A20'
): boolean {
  return (
    series !== 'DanceDanceRevolution A' &&
    (deletedOnA.includes(songId) ||
      (series === 'DanceDanceRevolution A3' &&
        deletedOnA20Plus.includes(songId)))
  )
}

/** Deleted song id on DanceDanceRevolution A. */
const deletedOnA = [
  '1IbDP96O99Ob10PoPdP98IDqibqo9lqI', // KUNG FU FIGHTING
  'qoIDP9I968q8do0d6d6lQDIi8biPIoi1', // BAD GIRLS
  '9Do1l69IiP98IO91bd86oIIoQqQI9QPb', // Boom Boom Dollar (Red Monster Mix)
  'O6DPoIoQibQO1iD6I0DDDbbddDOi9QDq', // stomp to my beat
  '19l9bOoI8Dib69D0DodDo1d8i8IDb88q', // ポリリズム
  '1bD9Pi1bdPdOO111iPlbQl0iI6qdoPIo', // Trickster
  '6b8lbl11Ii81bIiq1D9do811D986iDOq', // IF YOU WERE HERE
  '81II88dobiP6Q1iq6dDOPqPQQ1dO0Qq9', // IF YOU WERE HERE (L.E.D.-G STYLE REMIX)
  'oqQIlDl811qQI01O8dDdl699OI9IbIlO', // 女々しくて
  '8d6DoOIdD61DOIQI1I0869qO99iii68Q', // future gazer
  'Q6Do1o1bP60Q1O00Dbbqd96Oq9dQd6i6', // LOVE & JOY
  '6i86dIDQQ8DQ60Piq1bqO0i08qI0ibPI', // STRAIGHT JET
  'PPDQloDPD9l1dOd6DOi8Oq8IIob9IPO1', // 折れないハート
  'odObQ86Qd1qOD9oiP6OdObdP8lqiiD8b', // ジョジョ～その血の運命～
  'l88PDoOI6b1o1ddI9bDDPil6QdDbPobI', // ふりそでーしょん
  'b1b966I1PQ6Qo6bdI6i9i1D1bqdd188i', // Burst The Gravity
  'O06bdqiPIb6i1OdqoQo0qQ0DoO1Od08O', // Choo Choo TRAIN
  '6qOIDDb9libIDlQI80l88P0io68Qq0O8', // LOVE & JOY -Risk Junk MIX-
  'l9Di1l6I68ilPDlPlO6qO61l11P008OQ', // Mickey Mouse March(Eurobeat Version)
  'qPPbDIqol6d06iD6dIdid6QQ9oPq9IDo', // Strobe♡Girl
]
/** Deleted song id on DanceDanceRevolution A20 PLUS. */
const deletedOnA20Plus = [
  '19id1DO6q9Pb1681db61D8D8oQi9dlb6', // SP初段(A20)
  'b9OboQl6d9PqQddIdQDobP0d8o6dOqob', // SP二段(A20)
  'P986dlQP0DO0106oq0P81Qi0QQDQ666O', // SP三段(A20)
  'o0DP6qqql9D1bDbQPOQiP8iIq81qI8O9', // SP四段(A20)
  '880I00ODqPD1OQQPOP0Pd19Qq1qiloDP', // SP五段(A20)
  'PbIq9b1I161P0iD18qQiOO9qIoodbDIP', // SP六段(A20)
  '666q06q6I01loQOq0qd98IIOObIDOd8q', // SP七段(A20)
  'l8Q1Od0d0IQOQl61l8lIlPiI80P10OQb', // SP八段(A20)
  'ol8oiPo8iod9bDPPD1qdlbPd1ddqP6oP', // SP九段(A20)
  'OPi8oobIDid6q0P18QdD11D6O1I6Ioqo', // SP十段(A20)
  'qDDlD0blPO68IQiOQ8i1qPDd8IOPIIO6', // SP皆伝(A20)
  '9IliQ1O0dOQPiObPDDDblDO6oliDodlb', // DP初段(A20)
  'IlQodD9Dbld8QiOql68bPPQbd6bll6i1', // DP二段(A20)
  'dib16I1b0o9OdOd1O90dO1Q6iIO9PQo9', // DP三段(A20)
  '8OoDQb16lP0i96qiDQqo90Q6bOP1o89D', // DP四段(A20)
  'ddql809Qo8q68918lIDOPDQ6q1liD9b6', // DP五段(A20)
  '9D69dQo1dQqPD6l9ObiI0b0i8d9ddool', // DP六段(A20)
  'Pbbidbl9l8IqddQOq0069oQ6Oi1DQdP1', // DP七段(A20)
  'idiOI1Qb9D0dQI6IOlob8QbOqdDOoObP', // DP八段(A20)
  'ID9Dqo9QQQIP9ObD0lbbi6O6PiD18oD0', // DP九段(A20)
  'bPQDblO8Do0Oo9O0PP0b8PO1PblDioDP', // DP十段(A20)
  'o1Q8Ol8Dol9b0dllD6P0iPQbIoP666Db', // DP皆伝(A20)
  '91qD6DbDqi96qbIO66oboliPD8IPP6io', // 輪廻転生
  'qOlDPoiqibIOqod69dPilbiqD6qdO1qQ', // More One Night
  'dOblQOoDb96l00dqPlIb9DQl86q9PboI', // 回レ！雪月花
  'od66Qb16lI019I06lllII811I9ol6l0i', // ようこそジャパリパークへ
  'PqOilI0ql6QDID6oo0Qb9iDo1doqQqPQ', // 放課後ストライド
  'blDbDqdo1D0odlQd9biIoio8ioQPb80i', // only my railgun
  '00q86iQQIIiOlqi6Doqi6b9PiOodo10O', // Believe
  '6DP8POdO1PiP0D8il08Po6iD8oI9Pidl', // Break Free
  '9OP0iqDD8PDIb8lblD0ol09oP1I1d9PO', // Happy
  'dll6Dq0blbl1iPbIIiQ61QIoo00doqiI', // Hillbilly Shoes
  '00Qbd9qoI681Q0biQOIiI08bI91i080l', // I Want You To Know
  'qPi8qIqO1lQd08b01PiPlql9O1dOPDPq', // Shut Up and Dance
  '1i8d1DodloQiQ8doOlloDIOO9PI6OIoO', // Time Of Our Lives
  'io9b89PD18ibIO8PIqb1QODliqDdqiIO', // Wake Me Up
  'Ol01P9IIoDIOldo8IQI0l6bd9lb9q0oo', // 六兆年と一夜物語
  '80Q1idDo6O6Db0106b0q6qbOP1P8QQb0', // 39
  'QPd01OQqbOIiDoO1dbdo1IIbb60bqPdl', // 愛言葉
  'd0DDd1dP6llPbioqPdiQ0IDd918bDqI8', // ありふれたせかいせいふく
  '666ObIO9bO8D8q8q08I1OQo96DdIbbiO', // すろぉもぉしょん
  'D16P668Q8loqIoDo1IdoIlIloiIoIDll', // *ハロー、プラネット。
  'b9QiIQ18b6o1bqPdqI6lI1OIqboPIDI9', // 妄想税
  'q6661PIbbb1O80OQQ11iD6bP1l6bio0Q', // The Light
  'DQilQP810dq8D9i11q6Oq0ooDdQQO0lI', // HARD DANCE
  '6bo6ID6l11qd6lolilI6o6q8I6ddo88i', // SP初段(A20 PLUS)
  'd0l89dI9d6Di11DQ9P8D1Pl1d0Db81D9', // SP二段(A20 PLUS)
  'b6qOqD9bOQO1O0q8000D6dIdqb80li1b', // SP三段(A20 PLUS)
  '6loIiOd8PP90dPOq16Q6PdPPO0DQDOPP', // SP四段(A20 PLUS)
  '91DOoD99iIq9oIdOi9QqDQ0qlQPQPOii', // SP五段(A20 PLUS)
  'odPd96PliIo9OIO8q8iD8Qd6QoId6o1d', // SP六段(A20 PLUS)
  'l6Pd9dQdoq1qI9iOOqdbDQI0qiQioP60', // SP七段(A20 PLUS)
  'O91QbQb0QdObIO6d8lo8lq00ibOQP9PQ', // SP八段(A20 PLUS)
  'OdOP8o0dQdo0DPiio6dI8QId869D9oqd', // SP九段(A20 PLUS)
  'o11OO8oodDODD0oolD6ql6DiODPQboOo', // SP十段(A20 PLUS)
  '6q6Oil608iDQlOD86d1qiDPo8Dd8IP16', // SP皆伝(A20 PLUS)
  'bIb6Q6DD9iP1d61dbOqdi6IQPllOb1IP', // DP初段(A20 PLUS)
  'iDiiO18PPl6iDlDlddi9ildIqO60bQdo', // DP二段(A20 PLUS)
  'Iblb8l6qPOQD8do891b1O0Pd9q60b6oD', // DP三段(A20 PLUS)
  'ilD1Qb1IqqDP1bo1i66q688q6doPq6Qb', // DP四段(A20 PLUS)
  'q0IObiQdI9o918O0DbPlldqd01liQ8Ql', // DP五段(A20 PLUS)
  'dO01ddIq0bq9019olIDoD1IIPIb9DQ9D', // DP六段(A20 PLUS)
  'b0DliOIqlP9lldO9qQo0986QIo9io96d', // DP七段(A20 PLUS)
  'oiqql6iPq8Oq0QIqlqb1DOOO8ioPo8b9', // DP八段(A20 PLUS)
  'DQqi68IP1qbDiQ9li6PI1Q9Iddd6o9QQ', // DP九段(A20 PLUS)
  '9O0b1DddI6OiOD6PQbboPbdd8Pi1iPlb', // DP十段(A20 PLUS)
  '199ODd8l0Qld9i6DdqOdb1ll66D1I1Q9', // DP皆伝(A20 PLUS)
  'dll9D90dq1O09oObO66Pl8l9I9l0PbPP', // B4U (The Acolyte mix) (Old Song id)
  'qbbOOO1QibO1861bqQII9lqlPiIoqb98', // FIRST
  'I90bQ81P1blOPIdd9PPl6I9D8DQ1dIob', // TWENTY
  '88o8Oq69ldilblP10DI0qqb6b8I0DDi9', // BOUNCE
  'q6oOPqQPlOQoooq888bPI1OPDlqDIQQD', // PASSION
  'i1DqPb01I6I1dP8qoO1qiIPDlOD9D9oQ', // PLANET
  'DQilQP810dq8D9i11q6Oq0ooDdQQO0lI', // HARD DANCE
]
