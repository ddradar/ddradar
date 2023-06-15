import Oruga from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'

export default defineNuxtPlugin(({ vueApp }) => {
  vueApp.use(Oruga, bulmaConfig)
})

declare module 'vue' {
  export interface GlobalComponents {
    OButton: typeof import('@oruga-ui/oruga-next/src/components/button/Button.vue').default
    OCheckbox: typeof import('@oruga-ui/oruga-next/src/components/checkbox/Checkbox.vue').default
    OCollapse: typeof import('@oruga-ui/oruga-next/src/components/collapse/Collapse.vue').default
    OField: typeof import('@oruga-ui/oruga-next/src/components/field/Field.vue').default
    OIcon: typeof import('@oruga-ui/oruga-next/src/components/icon/Icon.vue').default
    OInput: typeof import('@oruga-ui/oruga-next/src/components/input/Input.vue').default
    OLoading: typeof import('@oruga-ui/oruga-next/src/components/loading/Loading.vue').default
    ONotification: typeof import('@oruga-ui/oruga-next/src/components/notification/Notification.vue').default
    OSelect: typeof import('@oruga-ui/oruga-next/src/components/select/Select.vue').default
    OSkeleton: typeof import('@oruga-ui/oruga-next/src/components/skeleton/Skeleton.vue').default
    OSwitch: typeof import('@oruga-ui/oruga-next/src/components/switch/Switch.vue').default
    OTable: typeof import('@oruga-ui/oruga-next/src/components/table/Table.vue').default
    OTableColumn: typeof import('@oruga-ui/oruga-next/src/components/table/TableColumn.vue').default
    OTooltip: typeof import('@oruga-ui/oruga-next/src/components/tooltip/Tooltip.vue').default
  }
}
