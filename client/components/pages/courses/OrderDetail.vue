<template>
  <section>
    <card :title="chartTitle" :type="cardType" collapsible>
      <div class="card-content">
        <div class="table-container">
          <b-table
            :data="scores"
            :loading="loading"
            :mobile-cards="false"
            :selected="userScore"
            narrowed
            striped
          >
            <template v-slot="props">
              <b-table-column field="name" :label="$t('list.name')">
                <nuxt-link
                  v-if="!props.row.isArea"
                  :to="`/users/${props.row.userId}`"
                  class="is-size-7"
                >
                  {{ props.row.userName }}
                </nuxt-link>
                <span v-else class="is-size-7">{{ props.row.userName }}</span>
              </b-table-column>
              <b-table-column field="score" :label="$t('list.score')" centered>
                <score-badge
                  :lamp="props.row.clearLamp"
                  :score="props.row.score"
                />
              </b-table-column>
              <b-table-column
                field="exScore"
                :label="$t('list.exScore')"
                numeric
              >
                <span class="is-size-7">{{ props.row.exScore }}</span>
              </b-table-column>
            </template>

            <template v-slot:empty>
              <section class="section">
                <div class="content has-text-grey has-text-centered">
                  <p>{{ $t('list.noData') }}</p>
                </div>
              </section>
            </template>
          </b-table>
        </div>
      </div>
      <footer class="card-footer">
        <a
          v-if="this.$accessor.isLoggedIn"
          class="card-footer-item"
          @click="launchScoreEditor"
        >
          {{ $t('button.edit') }}
        </a>
        <a
          v-if="this.$accessor.isLoggedIn"
          class="card-footer-item"
          @click="launchScoreImporter"
        >
          {{ $t('button.import') }}
        </a>
        <a class="card-footer-item" @click="fetchScores(true)">
          {{ $t('button.all') }}
        </a>
      </footer>
    </card>
    <card title="Chart Info" :type="cardType" collapsible>
      <div class="card-content">
        <div class="content">
          <ul>
            <li><em>Notes</em>: {{ chart.notes }}</li>
            <li><em>Freeze Arrow</em>: {{ chart.freezeArrow }}</li>
            <li><em>Shock Arrow</em>: {{ chart.shockArrow }}</li>
          </ul>
          <ol>
            <li v-for="o in orders" :key="o.id">
              <nuxt-link :to="o.to">{{ o.name }}</nuxt-link>
              {{ o.chartName }}
            </li>
          </ol>
        </div>
      </div>
    </card>
  </section>
</template>

<i18n>
{
  "ja": {
    "list": {
      "name": "ユーザー名",
      "score": "スコア",
      "exScore": "EX",
      "noData": "データがありません",
      "top": "{area}トップ"
    },
    "button": {
      "edit": "編集",
      "import": "インポート",
      "all": "全件表示"
    },
    "area": {
      "0": "全国",
      "1": "北海道",
      "2": "青森県",
      "3": "岩手県",
      "4": "宮城県",
      "5": "秋田県",
      "6": "山形県",
      "7": "福島県",
      "8": "茨城県",
      "9": "栃木県",
      "10": "群馬県",
      "11": "埼玉県",
      "12": "千葉県",
      "13": "東京都",
      "14": "神奈川県",
      "15": "新潟県",
      "16": "富山県",
      "17": "石川県",
      "18": "福井県",
      "19": "山梨県",
      "20": "長野県",
      "21": "岐阜県",
      "22": "静岡県",
      "23": "愛知県",
      "24": "三重県",
      "25": "滋賀県",
      "26": "京都府",
      "27": "大阪府",
      "28": "兵庫県",
      "29": "奈良県",
      "30": "和歌山県",
      "31": "鳥取県",
      "32": "島根県",
      "33": "岡山県",
      "34": "広島県",
      "35": "山口県",
      "36": "徳島県",
      "37": "香川県",
      "38": "愛媛県",
      "39": "高知県",
      "40": "福岡県",
      "41": "佐賀県",
      "42": "長崎県",
      "43": "熊本県",
      "44": "大分県",
      "45": "宮崎県",
      "46": "鹿児島県",
      "47": "沖縄県",
      "48": "香港",
      "49": "韓国",
      "50": "台湾",
      "51": "アメリカ",
      "52": "ヨーロッパ",
      "53": "海外",
      "106": "カナダ",
      "107": "シンガポール",
      "108": "タイ",
      "109": "オーストラリア",
      "110": "ニュージーランド",
      "111": "イギリス",
      "112": "イタリア",
      "113": "スペイン",
      "114": "ドイツ",
      "115": "フランス",
      "116": "ポルトガル",
      "117": "インドネシア",
      "118": "フィリピン"
    }
  },
  "en": {
    "list": {
      "name": "Name",
      "score": "Score",
      "exScore": "EX",
      "noData": "No Data",
      "top": "{area} Top"
    },
    "button": {
      "edit": "Edit",
      "import": "Import",
      "all": "Show All"
    },
    "area": {
      "0": "World",
      "1": "Hokkaido",
      "2": "Aomori",
      "3": "Iwate",
      "4": "Miyagi",
      "5": "Akita",
      "6": "Yamagata",
      "7": "Fukushima",
      "8": "Ibaraki",
      "9": "Tochigi",
      "10": "Gunma",
      "11": "Saitama",
      "12": "Chiba",
      "13": "Tokyo",
      "14": "Kanagawa",
      "15": "Niigata",
      "16": "Toyama",
      "17": "Ishikawa",
      "18": "Gukui",
      "19": "Yamanashi",
      "20": "Nagano",
      "21": "Gifu",
      "22": "Shizuoka",
      "23": "Aichi",
      "24": "Mie",
      "25": "Shiga",
      "26": "Kyoto",
      "27": "Osaka",
      "28": "Hyogo",
      "29": "Nara",
      "30": "Wakayama",
      "31": "Tottori",
      "32": "Shimane",
      "33": "Okayama",
      "34": "Hiroshima",
      "35": "Yamaguchi",
      "36": "Tokushima",
      "37": "Kagawa",
      "38": "Ehime",
      "39": "Kochi",
      "40": "Fukuoka",
      "41": "Saga",
      "42": "Nagasaki",
      "43": "Kumamoto",
      "44": "Oita",
      "45": "Miyazaki",
      "46": "Kagoshima",
      "47": "Okinawa",
      "48": "Hong Kong",
      "49": "Korea",
      "50": "Taiwan",
      "51": "USA",
      "52": "Europe",
      "53": "Oversea",
      "106": "Canada",
      "107": "Singapore",
      "108": "Thailand",
      "109": "Australia",
      "110": "New Zealand",
      "111": "United Kingdom",
      "112": "Italy",
      "113": "Spain",
      "114": "Germany",
      "115": "France",
      "116": "Portugal",
      "117": "Indonesia",
      "118": "Philippines"
    }
  }
}
</i18n>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import { CourseChart, CourseInfo } from '~/api/course'
import { getChartScore, UserScore } from '~/api/score'
import { getDifficultyName, getPlayStyleName } from '~/api/song'
import { areaList } from '~/api/user'
import ScoreEditor from '~/components/modal/ScoreEditor.vue'
import ScoreImporter from '~/components/modal/ScoreImporter.vue'
import Card from '~/components/shared/Card.vue'
import ScoreBadge from '~/components/shared/ScoreBadge.vue'

type RankingScore = UserScore & { isArea?: true }

@Component({ components: { Card, ScoreBadge } })
export default class OrderDetailComponent extends Vue {
  @Prop({ required: true, type: Object })
  readonly course!: CourseInfo

  @Prop({ required: true, type: Object })
  readonly chart!: CourseChart

  loading = true
  scores: RankingScore[] = []

  get userScore() {
    return this.scores.find(s => s.userId === this.$accessor.user?.id)
  }

  get chartTitle() {
    return this.getChartTitle(
      this.chart.playStyle,
      this.chart.difficulty,
      this.chart.level
    )
  }

  get cardType() {
    return `is-${getDifficultyName(this.chart.difficulty).toLowerCase()}`
  }

  get orders() {
    return this.chart.order.map(s => ({
      id: s.songId,
      name: s.songName,
      chartName: this.getChartTitle(s.playStyle, s.difficulty, s.level),
      to: `/songs/${s.songId}/${s.playStyle}${s.difficulty}`,
    }))
  }

  get isLoggedIn() {
    return !!this.$accessor.user
  }

  private getChartTitle(playStyle: number, difficulty: number, level: number) {
    const shortPlayStyle = getPlayStyleName(playStyle)[0] + 'P' // 'SP' or 'DP'
    const difficultyName = getDifficultyName(difficulty)
    return `${shortPlayStyle}-${difficultyName} (${level})`
  }

  async fetch() {
    await this.fetchScores()
  }

  launchScoreEditor() {
    this.$buefy.modal
      .open({
        parent: this,
        component: ScoreEditor,
        props: {
          songId: this.course.id,
          playStyle: this.chart.playStyle,
          difficulty: this.chart.difficulty,
          songData: this.course,
        },
        hasModalCard: true,
        trapFocus: true,
      })
      .$on('close', async () => await this.fetchScores())
  }

  launchScoreImporter() {
    this.$buefy.modal
      .open({
        parent: this,
        component: ScoreImporter,
        props: {
          songId: this.course.id,
          playStyle: this.chart.playStyle,
          difficulty: this.chart.difficulty,
          isCourse: true,
        },
        hasModalCard: true,
        trapFocus: true,
      })
      .$on('close', async () => await this.fetchScores())
  }

  /** Call Get Chart Score API */
  async fetchScores(fetchAllData: boolean = false) {
    this.loading = true
    try {
      const scores = await getChartScore(
        this.$http,
        this.course.id,
        this.chart.playStyle,
        this.chart.difficulty,
        fetchAllData ? 'full' : 'medium'
      )
      this.scores = scores.map(s => {
        const id = parseInt(s.userId, 10)
        if (!isNaN(id) && areaList[id]) {
          return {
            ...s,
            isArea: true,
            userName: this.$t('list.top', {
              area: this.$t(`area.${id}`),
            }) as string,
          }
        }
        return s
      })
    } catch {}
    this.loading = false
  }
}
</script>
