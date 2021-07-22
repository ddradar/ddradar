<template>
  <section class="section">
    <h1 class="title">{{ $t('title') }}</h1>

    <!-- Register -->
    <section class="section">
      <h1 id="register" class="title">{{ $t('register.title') }}</h1>
      <div class="content">
        <ol>
          <i18n path="register.description.step_1" tag="li">
            <template #twitter>
              <a href="/.auth/login/twitter">
                {{ $t('register.description.step_1_twitter') }}
              </a>
            </template>
            <template #github>
              <a href="/.auth/login/github">
                {{ $t('register.description.step_1_github') }}
              </a>
            </template>
          </i18n>
          <li>{{ $t('register.description.step_2') }}</li>
          <li>{{ $t('register.description.step_3') }}</li>
          <li>{{ $t('register.description.step_4') }}</li>
        </ol>
      </div>
    </section>

    <!-- Calc Radar -->
    <section class="section">
      <h1 id="radar" class="title">{{ $t('radar.title') }}</h1>

      <h2 id="radar-common" class="subtitle">{{ $t('radar.common.title') }}</h2>
      <div class="content">
        <ul>
          <i18n path="radar.common.list_1" tag="li">
            <a
              target="_blank"
              href="https://github.com/ddradar/ddradar/blob/master/core/score.ts#L65"
            >
              {{ $t('radar.common.list_1_0') }}
            </a>
          </i18n>
        </ul>
      </div>

      <h2 id="radar-stream" class="subtitle">STREAM</h2>
      <div class="content">
        <div class="box">{{ $t('radar.stream.calc') }}</div>
        <ul>
          <li>{{ $t('radar.stream.list_1') }}</li>
        </ul>
      </div>

      <h2 id="radar-voltage" class="subtitle">VOLTAGE</h2>
      <div class="content">
        <div class="box">{{ $t('radar.voltage.calc') }}</div>
        <ul>
          <i18n path="radar.voltage.list_1" tag="li">
            <b>{{ $t('radar.voltage.list_1_0') }}</b>
          </i18n>
        </ul>
      </div>

      <h2 id="radar-air" class="subtitle">AIR</h2>
      <div class="content">
        <div class="box">{{ $t('radar.air.calc') }}</div>
        <ul>
          <li>
            {{ $t('radar.air.list_1') }}
            <ul>
              <li>{{ $t('radar.air.list_1_1') }}</li>
              <li>{{ $t('radar.air.list_1_2') }}</li>
              <li>{{ $t('radar.air.list_1_3') }}</li>
            </ul>
          </li>
        </ul>
      </div>

      <h2 id="radar-freeze" class="subtitle">FREEZE</h2>
      <div class="content">
        <div class="box">{{ $t('radar.freeze.calc') }}</div>
        <ul>
          <li>
            {{ $t('radar.freeze.list_1') }}
            <ul>
              <li>{{ $t('radar.freeze.list_1_1') }}</li>
              <li>{{ $t('radar.freeze.list_1_2') }}</li>
              <li>{{ $t('radar.freeze.list_1_3') }}</li>
            </ul>
          </li>
        </ul>
      </div>

      <h2 id="radar-chaos" class="subtitle">CHAOS</h2>
      <div class="content">
        <div class="box">{{ $t('radar.chaos.calc') }}</div>
        <ul>
          <li>
            {{ $t('radar.chaos.list_1') }}
            <ul>
              <li>{{ $t('radar.chaos.list_1_1') }}</li>
              <li>{{ $t('radar.chaos.list_1_2') }}</li>
              <li>{{ $t('radar.chaos.list_1_3') }}</li>
            </ul>
          </li>
        </ul>
      </div>
    </section>
  </section>
</template>

<i18n>
{
  "ja": {
    "title": "ガイド",
    "register": {
      "title": "ユーザー登録",
      "description": {
        "step_1": "「ログイン」メニューの「{twitter}}」または「{github}」をクリックします。",
        "step_1_twitter": "Twitterでログイン",
        "step_1_github": "GitHubでログイン",
        "step_2": "「Azure Static Web Apps」の連携を許可します。",
        "step_3": "「Azure Static Web Apps」の認証画面に移るので、「Grant」をクリックします。",
        "step_4": "ユーザー登録画面に移るので、必要事項を入力し「登録」ボタンをクリックします。"
      }
    },
    "radar": {
      "title": "グルーブレーダー",
      "common": {
        "title": "共通事項",
        "list_1": "計算式の詳細については、{0}もご参照ください。",
        "list_1_0": "実装部分"
      },
      "stream": {
        "calc": "(譜面のSTREAM値) * (通常スコア) / 1,000,000",
        "list_1": "公式のMyグルーブレーダーと同じ計算式です。"
      },
      "voltage": {
        "calc": "(譜面のVOLTAGE値) * (MAX COMBO) / (譜面のNOTE数 + 譜面のショックアロー数)",
        "list_1": "公式のMyグルーブレーダーと異なり、{0}でも加算されます。",
        "list_1_0": "GOODで繋いだコンボ"
      },
      "air": {
        "calc": "(譜面のAIR値) * (踏めた数) / (譜面のNOTE数 + 譜面のショックアロー数)",
        "list_1": "「踏めた数」は、以下の数字となります。",
        "list_1_1": "Full Combo以上: 「譜面のNOTE数 + 譜面のショックアロー数」",
        "list_1_2": "Life 4: 「譜面のNOTE数 + 譜面のショックアロー数 - 3」 (Miss3 扱い)",
        "list_1_3": "それ以外: 「MAX COMBO」"
      },
      "freeze": {
        "calc": "(譜面のFREEZE値) * (踏めた数) / (譜面のFREEZE ARROW数)",
        "list_1": "「踏めた数」は、以下の数字となります。",
        "list_1_1": "Full Combo以上: 「譜面のFREEZE ARROW数」",
        "list_1_2": "Life 4: 「譜面のFREEZE ARROW数 - 3」 (Miss3 扱い)",
        "list_1_3": "それ以外: 0"
      },
      "chaos": {
        "calc": "(譜面のCHAOS値) * (踏めた数) / (譜面のNOTE数 + 譜面のショックアロー数)",
        "list_1": "「踏めた数」は、以下の数字となります。",
        "list_1_1": "Full Combo以上: 「譜面のNOTE数 + 譜面のショックアロー数」",
        "list_1_2": "Life 4: 「譜面のNOTE数 + 譜面のショックアロー数 - 3」 (Miss3 扱い)",
        "list_1_3": "それ以外: 「MAX COMBO」"
      }
    }
  },
  "en": {
    "title": "Guide",
    "register": {
      "title": "User Resistration",
      "description": {
        "step_1": "Click \"{twitter}\" or \"{github}\" button in Login menu.",
        "step_1_twitter": "Login via Twitter",
        "step_1_github": "Login via GitHub",
        "step_2": "Authorize \"Azure Static Web Apps\".",
        "step_3": "Click \"Grant\" button.",
        "step_4": "Input your information and click \"Save\" button on User Settings page."
      }
    },
    "radar": {
      "title": "Groove Radar",
      "common": {
        "title": "Common",
        "list_1": "For more information, please see {0}.",
        "list_1_0": "Implementation"
      },
      "stream": {
        "calc": "(Chart's STREAM) * (Normal Score) / 1,000,000",
        "list_1": "Same as official."
      },
      "voltage": {
        "calc": "(Chart's VOLTAGE) * (MAX COMBO) / (Chart's Note count + Chart's Shock Arrow count)",
        "list_1": "Counted {0}, so it is NOT same as official.",
        "list_1_0": "GOOD Combo"
      },
      "air": {
        "calc": "(Chart's AIR) * (Count) / (Chart's Note count + Chart's Shock Arrow count)",
        "list_1": "(Count) is like below:",
        "list_1_1": "Full Combo or above: (Chart's Note count + Chart's Shock Arrow count)",
        "list_1_2": "Life 4: (Chart's Note count + Chart's Shock Arrow count) - 3 (Treat as miss:3)",
        "list_1_3": "Else: (MAX COMBO)"
      },
      "freeze": {
        "calc": "(Chart's FREEZE) * (Count) / (Chart's Freeze Arrow count)",
        "list_1": "(Count) is like below:",
        "list_1_1": "Full Combo or above: (Chart's Freeze Arrow count)",
        "list_1_2": "Life 4: (Chart's Freeze Arrow count - 3) (Treat as miss:3)",
        "list_1_3": "Else: 0"
      },
      "chaos": {
        "calc": "(Chart's CHAOS) * (Count) / (Chart's Note count + Chart's Shock Arrow count)",
        "list_1": "(Count) is like below:",
        "list_1_1": "Full Combo or above: (Chart's Note count + Chart's Shock Arrow count)",
        "list_1_2": "Life 4: (Chart's Note count + Chart's Shock Arrow count) - 3 (Treat as miss:3)",
        "list_1_3": "Else: (MAX COMBO)"
      }
    }
  }
}
</i18n>
