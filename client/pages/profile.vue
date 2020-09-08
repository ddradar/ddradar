<template>
  <section class="section">
    <b-message v-if="isNewUser" type="is-danger" has-icon>
      {{ $t('newUser') }}
    </b-message>
    <h1 class="title">{{ $t('title') }}</h1>

    <b-field :type="type" :message="message">
      <template slot="label">
        {{ $t('field.id') }}
        <b-tooltip type="is-dark" position="is-right" :label="$t('text.id')">
          <b-icon size="is-small" icon="help-circle-outline" />
        </b-tooltip>
      </template>
      <b-input
        v-model="id"
        :placeholder="$t('placeholder.id')"
        :disabled="!isNewUser"
        :loading="loading"
        @blur="checkId()"
      />
    </b-field>

    <b-field :label="$t('field.name')">
      <b-input v-model="name" required />
    </b-field>

    <b-field>
      <template slot="label">
        {{ $t('field.area') }}
        <b-tooltip type="is-dark" position="is-right" :label="$t('text.area')">
          <b-icon size="is-small" icon="help-circle-outline" />
        </b-tooltip>
      </template>
      <b-select
        v-model.number="area"
        :placeholder="$t('placeholder.area')"
        :disabled="!isNewUser"
      >
        <option v-for="area in areaOptions" :key="area.key" :value="area.key">
          {{ area.value }}
        </option>
      </b-select>
    </b-field>

    <b-field :label="$t('field.ddrCode')">
      <b-input
        v-model.number="code"
        :placeholder="$t('placeholder.ddrCode')"
        minlength="8"
        maxlength="8"
        pattern="^\d{8}$"
      />
    </b-field>

    <b-field grouped group-multiline>
      <b-switch v-model="isPublic">{{ $t('field.isPublic') }}</b-switch>
      <div class="help">
        <p v-if="isPublic">
          {{ $t('text.isPublic.public_0') }}<br />
          {{ $t('text.isPublic.public_1') }}
        </p>
        <p v-else>
          {{ $t('text.isPublic.private_0') }}<br />
          {{ $t('text.isPublic.private_1') }}
        </p>
        <p class="has-text-weight-bold has-text-danger">
          <b-icon size="is-small" icon="alert" />
          {{ $t('text.isPublic.caution') }}
        </p>
      </div>
    </b-field>

    <b-field>
      <b-button type="is-success" :disabled="hasError" @click="save()">
        {{ $t('save') }}
      </b-button>
    </b-field>
  </section>
</template>

<i18n>
{
  "ja": {
    "newUser": "ユーザー登録は、まだ完了していません。引き続き、以下の情報を入力してください。",
    "title": "ユーザー設定",
    "field": {
      "id": "ID",
      "name": "表示名",
      "area": "所属地域",
      "ddrCode": "DDR CODE(任意)",
      "isPublic": "公開する"
    },
    "text": {
      "id": "登録後の変更はできません。",
      "area": "登録後の変更はできません。",
      "isPublic": {
        "public_0": "ユーザー検索に表示され、ユーザーページは誰でも閲覧できるようになります。",
        "public_1": "これから登録するスコアはランキングに自動登録され、一般公開されます。",
        "private_0": "ユーザー検索に表示されず、ユーザーページはあなたしか閲覧できません。",
        "private_1": "これから登録するスコアは非公開となります。",
        "caution": "ONからOFFにしても、今までに登録したスコアは非公開になりません。ご注意ください。"
      }
    },
    "placeholder": {
      "id": "ID",
      "area": "Select",
      "ddrCode": "10000000"
    },
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
    },
    "message": {
      "id": {
        "required": "ユーザーIDは必須です",
        "invalid": "ユーザーIDは半角英数字, ハイフン, アンダーバーのみ使用可能です",
        "duplicate": "ユーザーIDはすでに使われています",
        "available": "ユーザーIDは使用可能です"
      },
      "success": "保存しました"
    },
    "save": "保存"
  },
  "en": {
    "newUser": "User registration has not been completed yet. Please continue to enter the following information.",
    "title": "User Settings",
    "field": {
      "id": "ID",
      "name": "Display Name",
      "area": "Area",
      "ddrCode": "DDR CODE(optional)",
      "isPublic": "Public"
    },
    "text": {
      "id": "can not be changed after registration.",
      "area": "can not be changed after registration.",
      "isPublic": {
        "public_0": "You will be shown in the user search and your page will be visible to anyone.",
        "public_1": "Registered scores will be public.",
        "private_0": "You are not shown in the user search and the user page is only visible to you.",
        "private_1": "Registered scores will be private.",
        "caution": "Note: Even if you turn off, the scores so far will not be private."
      }
    },
    "placeholder": {
      "id": "ID",
      "area": "Select",
      "ddrCode": "10000000"
    },
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
    },
    "message": {
      "id": {
        "required": "ID is required",
        "invalid": "Only alphanumeric characters, hyphens, and underbars can be used for ID",
        "duplicate": "User ID is already in use",
        "available": "This ID is available"
      },
      "success": "Saved"
    },
    "save": "Save"
  }
}
</i18n>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

import { areaList, existsUser, User } from '~/api/user'
import * as popup from '~/utils/popup'

@Component({ fetchOnServer: false })
export default class ProfilePage extends Vue {
  id: string = ''
  name: string = ''
  area: number = 0
  code: number | null = null
  isPublic: boolean = true

  loading = false
  type: '' | 'is-success' | 'is-danger' = ''
  message = ''

  get areaOptions() {
    return Object.keys(areaList).map(v => ({
      key: v,
      value: this.$t(`area.${v}`),
    }))
  }

  get isNewUser() {
    return !this.$accessor.user
  }

  get hasError() {
    return (
      this.type === 'is-danger' ||
      !/^[-a-z0-9_]+$/.test(this.id) ||
      !this.name ||
      !Object.keys(areaList).includes(`${this.area}`) ||
      (!!this.code &&
        (!Number.isInteger(this.code) ||
          this.code < 10000000 ||
          this.code > 99999999))
    )
  }

  /** Load user info */
  async fetch() {
    await this.$accessor.fetchUser()
    this.id = this.$accessor.user?.id ?? this.$accessor.auth?.userDetails ?? ''
    this.name = this.$accessor.user?.name ?? ''
    this.area = this.$accessor.user?.area ?? 0
    this.code = this.$accessor.user?.code ?? null
    this.isPublic = this.$accessor.user?.isPublic ?? true
  }

  async checkId() {
    // Required check
    if (!this.id) {
      this.type = 'is-danger'
      this.message = this.$t('message.id.required').toString()
      return
    }

    // Pattern check
    if (!/^[-a-z0-9_]+$/.test(this.id)) {
      this.type = 'is-danger'
      this.message = this.$t('message.id.invalid').toString()
      return
    }

    // Duplicate check from API
    this.loading = true
    const exists = await existsUser(this.$http, this.id)
    this.loading = false

    if (exists) {
      this.type = 'is-danger'
      this.message = this.$t('message.id.duplicate').toString()
    } else {
      this.type = 'is-success'
      this.message = this.$t('message.id.available').toString()
    }
  }

  async save() {
    const user: User = {
      id: this.id,
      name: this.name,
      area: this.area,
      isPublic: this.isPublic,
    }
    if (this.code) user.code = this.code
    try {
      await this.$accessor.saveUser(user)
      popup.success(this.$buefy, this.$t('message.success').toString())
    } catch (error) {
      popup.danger(this.$buefy, error.message ?? error)
    }
    this.type = ''
    this.message = ''
  }
}
</script>
