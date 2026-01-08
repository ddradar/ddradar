<script setup lang="ts">
import type { ButtonProps, PageFeatureProps } from '@nuxt/ui'

const links: ButtonProps[] = [
  {
    label: '曲を探す',
    to: '/songs',
    icon: 'i-lucide-music',
  },
  {
    label: '登録する',
    to: '/login',
    icon: 'i-lucide-square-play',
  },
]
const features: PageFeatureProps[] = [
  {
    icon: 'i-lucide-pie-chart',
    title: 'My グルーヴレーダー',
    description:
      'DDR A以降で廃止されたグルーヴレーダー機能を再現。自分の実力を確認・共有しましょう。',
  },
  {
    icon: 'i-lucide-arrow-up-0-1',
    title: 'EXスコアにネイティブ対応',
    description:
      'EXスコアの記録に対応。通常スコア・フルコンボ種別からの予測計算もできます。',
  },
  {
    icon: 'i-simple-icons-github',
    title: 'オープンソース',
    description:
      'DDRadarはオープンソースプロジェクトです。GitHubでソースコードを確認・貢献できます。',
  },
]
</script>

<template>
  <AuthState v-slot="{ user }">
    <template v-if="user?.id">
      <h1>ようこそ、{{ user.displayName || 'ゲスト' }}さん！</h1>
    </template>
    <template v-else>
      <UPageHero
        title="DDRadar"
        description="A Nuxt/Vue-integrated UI library providing a rich set of fully-styled, accessible and highly customizable components for building modern web applications."
        :links="links"
      />
      <UPageSection
        title="Beautiful Vue UI components"
        description="Nuxt UI provides a comprehensive suite of components and utilities to help you build beautiful and accessible web applications with Vue and Nuxt."
        :features="features"
      />
    </template>
  </AuthState>
</template>
