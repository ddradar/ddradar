<template>
  <section class="section">
    <h1 class="title">{{ $t('title') }}</h1>
    <section>
      <b-field grouped group-multiline>
        <b-field :label="$t('field.area')">
          <b-select v-model="area" placeholder="Select">
            <option
              v-for="area in areaOptions"
              :key="area.key"
              :value="area.key"
            >
              {{ area.value }}
            </option>
          </b-select>
        </b-field>
        <b-field :label="$t('field.name')">
          <b-input v-model="name" />
        </b-field>
        <b-field :label="$t('field.code')">
          <b-input
            v-model.number="code"
            placeholder="10000000"
            minlength="8"
            maxlength="8"
            pattern="^\d{8}$"
          />
        </b-field>
      </b-field>
      <b-field>
        <b-button type="is-success" @click="search()">
          {{ $t('search') }}
        </b-button>
      </b-field>
    </section>

    <section>
      <b-table
        :data="displayedUsers"
        striped
        :loading="loading"
        :mobile-cards="false"
        paginated
        per-page="50"
      >
        <template slot-scope="props">
          <b-table-column field="name" :label="$t('list.name')">
            <nuxt-link :to="`/users/${props.row.id}`">
              {{ props.row.name }}
            </nuxt-link>
          </b-table-column>
          <b-table-column field="area" :label="$t('list.area')">
            {{ props.row.area }}
          </b-table-column>
        </template>

        <template slot="empty">
          <section v-if="loading" class="section">
            <b-skeleton animated />
            <b-skeleton animated />
            <b-skeleton animated />
          </section>
          <section v-else class="section">
            <div class="content has-text-grey has-text-centered">
              <p>{{ $t('list.empty') }}</p>
            </div>
          </section>
        </template>
      </b-table>
    </section>
  </section>
</template>

<i18n>
{
  "ja": {
    "title": "ユーザーを探す",
    "field": {
      "area": "所属地域",
      "name": "登録名(部分一致)",
      "code": "DDR CODE"
    },
    "list": {
      "name": "登録名",
      "area": "所属地域",
      "empty": "ユーザーが見つかりません"
    },
    "search": "検索",
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
    "title": "Search User",
    "field": {
      "area": "Area",
      "name": "Name (partial match)",
      "code": "DDR CODE"
    },
    "list": {
      "name": "Name",
      "area": "Area",
      "empty": "Not Found User"
    },
    "search": "Search",
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
import { Component, Vue } from 'nuxt-property-decorator'

import { areaList, getUserList, UserListData } from '~/api/user'
import * as popup from '~/utils/popup'

@Component
export default class UserListPage extends Vue {
  name: string = ''
  area: number = 0
  code: number | null = null
  users: UserListData[] = []

  loading = false

  /** AreaCode - String mapping for <select> components */
  get areaOptions() {
    return Object.keys(areaList).map(key => ({
      key,
      value: this.$t(`area.${key}`),
    }))
  }

  get displayedUsers() {
    return this.users.map(u => ({
      id: u.id,
      name: u.name,
      area: this.$t(`area.${u.area}`),
    }))
  }

  /** Load user info */
  async search() {
    this.loading = true
    try {
      this.users = await getUserList(
        this.$http,
        this.name,
        this.area,
        this.code ?? 0
      )
    } catch (error) {
      popup.danger(this.$buefy, error.message ?? error)
    }
    this.loading = false
  }
}
</script>
