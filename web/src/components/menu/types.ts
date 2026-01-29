import type { RouteLocationRaw } from 'vue-router'

export type MenuKey = string

export interface MenuItem {
  id?: MenuKey
  label: string
  to?: RouteLocationRaw
  disabled?: boolean
  children?: MenuItem[]
}
