<template>
  <section class="line-box block">
    <div class="cal-head">
      <button class="btn" type="button" :disabled="prevDisabled" @click="prevMonth">
        上月
      </button>
      <div class="cal-title">{{ title }}</div>
      <button class="btn" type="button" @click="nextMonth">
        下月
      </button>
    </div>

    <table class="cal-table" aria-label="日历">
      <thead>
        <tr>
          <th class="th week-head" scope="col">周</th>
          <th v-for="d in weekDays" :key="d" class="th" scope="col">
            {{ d }}
          </th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="w in weeks"
          :key="w.key"
          class="week-row"
          :data-current="w.isCurrentWeek ? 'true' : 'false'"
        >
          <th class="week" scope="row">
            <div class="wk-no">W{{ w.weekIndexText }}</div>
            <div class="wk-name">{{ w.weekName }}</div>
          </th>

          <td v-for="day in w.days" :key="day.key" class="td">
            <button
              class="day"
              type="button"
              :data-out="day.isOut ? 'true' : 'false'"
              :data-today="day.isToday ? 'true' : 'false'"
              :data-week-current="w.isCurrentWeek ? 'true' : 'false'"
              :title="`${day.text} · ${w.weekName}`"
            >
              <div class="day-num">{{ day.num }}</div>
              <span v-if="day.isToday" class="today-star" aria-hidden="true">*</span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script setup lang="ts">
type DayCell = {
  key: string
  date: Date
  num: number
  text: string
  isOut: boolean
  isToday: boolean
}

type WeekRow = {
  key: string
  weekStart: Date
  weekIndex: number
  weekIndexText: string
  weekName: string
  isCurrentWeek: boolean
  days: DayCell[]
}

const minYear = 2026
const cycleNames = ['西凉周', '苍龙周', '北邙周', '国令周']
const weekDays = ['一', '二', '三', '四', '五', '六', '日']

function atNoon(d: Date) {
  const x = new Date(d)
  x.setHours(12, 0, 0, 0)
  return x
}

function dateKey(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function addDays(d: Date, n: number) {
  const x = atNoon(d)
  x.setDate(x.getDate() + n)
  return x
}

function startOfMonth(d: Date) {
  return atNoon(new Date(d.getFullYear(), d.getMonth(), 1))
}

function endOfMonth(d: Date) {
  return atNoon(new Date(d.getFullYear(), d.getMonth() + 1, 0))
}

function startOfWeekMonday(d: Date) {
  const x = atNoon(d)
  const dow = x.getDay() // 0=Sun..6=Sat
  const offset = dow === 0 ? 6 : dow - 1
  return addDays(x, -offset)
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

const todayRef = ref(atNoon(new Date()))
const currentWeekStart = computed(() => startOfWeekMonday(todayRef.value))

const viewYear = ref(minYear)
const viewMonth = ref(0)

function syncToSystemMonth() {
  const now = atNoon(new Date())
  todayRef.value = now

  const y = now.getFullYear()
  const m = now.getMonth()

  if (y < minYear) {
    viewYear.value = minYear
    viewMonth.value = 0
    return
  }

  viewYear.value = y
  viewMonth.value = m
}

onMounted(() => {
  syncToSystemMonth()
})

const title = computed(() => `${viewYear.value} 年 ${String(viewMonth.value + 1).padStart(2, '0')} 月`)

const baseWeekStart = startOfWeekMonday(new Date(minYear, 0, 1))

function weekIndexFromStart(weekStart: Date) {
  const a = startOfWeekMonday(weekStart).getTime()
  const b = baseWeekStart.getTime()
  const diffDays = Math.round((a - b) / 86400000)
  return Math.floor(diffDays / 7) + 1
}

function weekNameByIndex(weekIndex: number) {
  return cycleNames[(weekIndex - 1) % cycleNames.length]
}

const weeks = computed<WeekRow[]>(() => {
  const monthStart = startOfMonth(new Date(viewYear.value, viewMonth.value, 1))
  const monthEnd = endOfMonth(monthStart)

  const gridStart = startOfWeekMonday(monthStart)
  const gridEnd = addDays(startOfWeekMonday(addDays(monthEnd, 6)), 6)

  const rows: WeekRow[] = []
  let cursor = gridStart

  while (cursor.getTime() <= gridEnd.getTime()) {
    const weekStart = cursor
    const weekIndex = weekIndexFromStart(weekStart)
    const weekName = weekNameByIndex(weekIndex)
    const weekIndexText = String(weekIndex).padStart(2, '0')
    const isCurrentWeek = dateKey(weekStart) === dateKey(currentWeekStart.value)

    const days: DayCell[] = Array.from({ length: 7 }).map((_, i) => {
      const d = addDays(weekStart, i)
      return {
        key: dateKey(d),
        date: d,
        num: d.getDate(),
        text: dateKey(d),
        isOut: !isSameMonth(d, monthStart),
        isToday: dateKey(d) === dateKey(todayRef.value)
      }
    })

    rows.push({
      key: `${dateKey(weekStart)}-${weekIndex}`,
      weekStart,
      weekIndex,
      weekIndexText,
      weekName,
      isCurrentWeek,
      days
    })

    cursor = addDays(weekStart, 7)
  }

  return rows
})

const prevDisabled = computed(() => viewYear.value === minYear && viewMonth.value === 0)

function prevMonth() {
  if (prevDisabled.value) return
  if (viewMonth.value === 0) {
    viewYear.value -= 1
    viewMonth.value = 11
    return
  }
  viewMonth.value -= 1
}

function nextMonth() {
  if (viewMonth.value === 11) {
    viewYear.value += 1
    viewMonth.value = 0
    return
  }
  viewMonth.value += 1
}
</script>

<style scoped>
.block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.cal-title {
  font-size: 13px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.btn {
  border: 1px solid var(--line);
  background: transparent;
  padding: 6px 10px;
  cursor: pointer;
}

.btn:hover {
  background: rgba(30, 30, 30, 0.06);
}

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.cal-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.th,
.td,
.week {
  border: 1px solid var(--line);
  background: #fff;
}

.th {
  height: 36px;
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0.08em;
  text-align: center;
}

.td {
  padding: 0;
  height: 44px;
}

.week-head {
  width: 110px;
  text-align: left;
  padding-left: 10px;
}

.week {
  width: 110px;
  padding: 8px 10px;
  text-align: left;
  vertical-align: top;
}

.week-row[data-current='true'] .week {
  background: rgba(15, 125, 167, 0.08);
}

.wk-no {
  font-size: 12px;
  letter-spacing: 0.1em;
  opacity: 0.85;
}

.wk-name {
  font-size: 12px;
  opacity: 0.85;
}

.day {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 44px;
  border: 0;
  background: transparent;
  padding: 6px 8px;
  cursor: default;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
}

.day:hover {
  background: rgba(30, 30, 30, 0.04);
}

.day[data-week-current='true'] {
  background: rgba(15, 125, 167, 0.04);
}

.day[data-out='true'] {
  opacity: 0.35;
}

.day[data-today='true'] {
  background: rgba(15, 125, 167, 0.12);
  box-shadow: inset 0 0 0 1px #0f7da7;
}

.today-star {
  position: absolute;
  top: 6px;
  right: 6px;
  font-size: 12px;
  line-height: 1;
  opacity: 0.9;
  color: #0f7da7;
}

.day-num {
  font-size: 13px;
  font-weight: 600;
}
</style>
