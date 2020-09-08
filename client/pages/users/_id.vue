<template>
  <section class="section">
    <template v-if="!user && !$fetchState.pending">{{ $t('empty') }}</template>
    <template v-else>
      <h1 v-if="user" class="title">{{ user.name }}</h1>
      <b-skeleton v-else class="title" animated />

      <h2 v-if="user" class="subtitle">{{ areaName }} / {{ ddrCode }}</h2>
      <b-skeleton v-else class="subtitle" animated />

      <div v-if="isSelfPage" class="buttons">
        <b-button
          icon-left="import"
          type="is-primary"
          tag="nuxt-link"
          to="/import"
        >
          {{ $t('import') }}
        </b-button>
        <b-button
          icon-left="account-cog"
          type="is-info"
          tag="nuxt-link"
          to="/profile"
        >
          {{ $t('settings') }}
        </b-button>
      </div>
    </template>
  </section>
</template>

<i18n>
{
  "ja": {
    "empty": "ユーザーが存在しないか、非公開に設定されています。",
    "import": "スコアのインポート",
    "settings": "設定",
    "area": {
      "0": "未指定",
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
    "empty": "User does not exist or is private",
    "import": "Import Scores",
    "settings": "Settings",
    "area": {
      "0": "undefined",
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
import { Context } from '@nuxt/types'
import { Component, Vue } from 'nuxt-property-decorator'

import { getUserInfo, UserListData } from '~/api/user'

@Component({ fetchOnServer: false })
export default class UserPage extends Vue {
  user: UserListData | null = null

  get areaName() {
    return this.user ? this.$t(`area.${this.user.area}`) : ''
  }

  get ddrCode() {
    return this.user?.code
      ? String(this.user.code).replace(/^(\d{4})(\d{4})$/, '$1-$2')
      : ''
  }

  get isSelfPage() {
    const loginId = this.$accessor.user?.id
    return !!this.user && this.user.id === loginId
  }

  /** id expected [a-z], [0-9], [-], [_] */
  validate({ params }: Pick<Context, 'params'>) {
    return /^[-a-z0-9_]+$/.test(params.id)
  }

  /** Fetch User info from API */
  async fetch() {
    const id = this.$route.params.id
    try {
      this.user = await getUserInfo(this.$http, id)
    } catch {
      this.user = null
    }
  }
}
</script>
