<template>
  <div
    ref="rootRef"
    class="relative w-full h-6 select-none"
    :class="disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'"
    role="slider"
    :aria-disabled="disabled"
    :aria-valuemin="min"
    :aria-valuemax="max"
    :aria-valuenow="modelValue"
    :tabindex="disabled ? -1 : 0"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerCancel"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
    @keydown="onKeydown"
  >
    <div class="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white/18"/>
    <div
      class="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[var(--td-brand-color)]"
      :style="{ width: `${percent}%` }"
    />

    <div
      v-show="showTooltip && (hovering || dragging)"
      class="absolute top-0 -translate-y-2.5 px-1.5 py-0.5 rounded bg-black/70 text-white text-xs font-mono tabular-nums pointer-events-none"
      :style="{ left: `${percent}%`, transform: 'translate(-50%, -100%)' }"
    >
      {{ tooltipText }}
    </div>

    <div
      class="absolute top-1/2 w-3.5 h-3.5 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white shadow"
      :style="{ left: `${percent}%` }"
    />
  </div>
</template>

<script setup lang="ts">
type TooltipFormatter = (value: number) => string;

const props = withDefaults(defineProps<{
  modelValue: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  showTooltip?: boolean;
  tooltipFormatter?: TooltipFormatter;
}>(), {
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
  showTooltip: true,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void;
  (e: 'change-end', value: number): void;
  (e: 'pointerdown', ev: PointerEvent): void;
}>();

const rootRef = ref<HTMLElement>();
const dragging = ref(false);
const hovering = ref(false);

const percent = computed(() => {
  const range = props.max - props.min;
  if (!Number.isFinite(range) || range <= 0) return 0;
  const raw = ((props.modelValue - props.min) / range) * 100;
  return clamp(raw, 0, 100);
});

const tooltipText = computed(() => {
  if (props.tooltipFormatter) return props.tooltipFormatter(props.modelValue);
  const stepDecimals = getDecimals(props.step);
  return props.modelValue.toFixed(stepDecimals);
});

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getDecimals(n: number) {
  if (!Number.isFinite(n)) return 0;
  const s = String(n);
  const i = s.indexOf('.');
  return i === -1 ? 0 : Math.min(8, s.length - i - 1);
}

function roundToStep(value: number) {
  const step = props.step;
  if (!Number.isFinite(step) || step <= 0) return value;
  const decimals = getDecimals(step);
  const stepped = props.min + Math.round((value - props.min) / step) * step;
  return Number(stepped.toFixed(decimals));
}

function valueFromPointer(ev: PointerEvent) {
  const el = rootRef.value;
  if (!el) return props.min;
  const rect = el.getBoundingClientRect();
  if (!rect.width) return props.min;
  const ratio = clamp((ev.clientX - rect.left) / rect.width, 0, 1);
  const raw = props.min + ratio * (props.max - props.min);
  return clamp(roundToStep(raw), props.min, props.max);
}

function updateFromPointer(ev: PointerEvent, commit: boolean) {
  const next = valueFromPointer(ev);
  emit('update:modelValue', next);
  if (commit) emit('change-end', next);
}

function onPointerDown(ev: PointerEvent) {
  if (props.disabled) return;
  if (ev.button !== 0) return;
  dragging.value = true;
  rootRef.value?.setPointerCapture(ev.pointerId);
  emit('pointerdown', ev);
  updateFromPointer(ev, false);
}

function onPointerMove(ev: PointerEvent) {
  if (props.disabled) return;
  if (!dragging.value) return;
  updateFromPointer(ev, false);
}

function onPointerUp(ev: PointerEvent) {
  if (props.disabled) return;
  if (!dragging.value) return;
  dragging.value = false;
  updateFromPointer(ev, true);
}

function onPointerCancel(ev: PointerEvent) {
  if (props.disabled) return;
  if (!dragging.value) return;
  dragging.value = false;
  updateFromPointer(ev, true);
}

function onKeydown(ev: KeyboardEvent) {
  if (props.disabled) return;
  const key = ev.key;
  if (key !== 'ArrowLeft' && key !== 'ArrowRight' && key !== 'ArrowUp' && key !== 'ArrowDown' && key !== 'Home' && key !== 'End') return;
  ev.preventDefault();

  const step = Number.isFinite(props.step) && props.step > 0 ? props.step : 1;
  let next = props.modelValue;
  if (key === 'Home') next = props.min;
  else if (key === 'End') next = props.max;
  else if (key === 'ArrowLeft' || key === 'ArrowDown') next = props.modelValue - step;
  else if (key === 'ArrowRight' || key === 'ArrowUp') next = props.modelValue + step;

  next = clamp(roundToStep(next), props.min, props.max);
  emit('update:modelValue', next);
  emit('change-end', next);
}
</script>

