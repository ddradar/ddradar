<template>
  <section class="section">
    <h1 class="title">{{ $t('title') }}</h1>
    <h2 id="stream" class="subtitle">STREAM</h2>
    <div class="content">
      <div class="box">{{ $t('calc.stream') }}</div>
    </div>
    <h2 id="voltage" class="subtitle">VOLTAGE</h2>
    <div class="content">
      <div class="box">{{ $t('calc.voltage') }}</div>
    </div>
    <h2 id="air" class="subtitle">AIR</h2>
    <div class="content">
      <div class="box">{{ $t('calc.air') }}</div>
    </div>
    <h2 id="freeze" class="subtitle">FREEZE</h2>
    <div class="content">
      <div class="box">{{ $t('calc.freeze') }}</div>
    </div>
    <h2 id="chaos" class="subtitle">CHAOS</h2>
    <div class="content">
      <div class="box">{{ $t('calc.chaos') }}</div>
    </div>
  </section>
</template>

<i18n>
{
  "ja": {
    "title": "Myグルーヴレーダーの計算式",
    "calc": {
      "stream": "(譜面のSTREAM値) * (通常スコア) / 1,000,000",
      "voltage": "(譜面のSTREAM値) * (MAX COMBO) / (ノート数 + ショックアロー数)",
      "air": "(譜面のSTREAM値) * (通常スコア) / 1,000,000",
      "freeze": "(譜面のSTREAM値) * (通常スコア) / 1,000,000",
      "chaos": "(譜面のSTREAM値) * (通常スコア) / 1,000,000"
    }
  }
}
</i18n>
