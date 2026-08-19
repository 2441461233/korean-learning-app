import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>

function Doodle({ children, ...props }: P) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  )
}

export function DoodleStar(props: P) {
  return (
    <Doodle fill="currentColor" stroke="none" {...props}>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
    </Doodle>
  )
}

export function DoodleSparkles(props: P) {
  return (
    <Doodle fill="currentColor" stroke="none" {...props}>
      <path d="M8 3l1 2.8L12 7l-3 1.2L8 11 7 8.2 4 7l3-1.2z" />
      <path d="M17 12l.8 2.2 2.2.8-2.2.8L17 18l-.8-2.2-2.2-.8 2.2-.8z" />
    </Doodle>
  )
}

export function DoodleFlame(props: P) {
  return (
    <Doodle {...props}>
      <path d="M12 3.5c1.6 2.6-2.4 4.2-1.5 6.7.7 1.9 2.9 1.6 2.8-.5 1.9 1.4 2.8 4 1.6 6.2-1.3 2.6-4.7 3.4-6.9 1.9-2.4-1.6-3-4.7-1.3-7.3C8.2 8.3 10.9 6.7 12 3.5z" />
    </Doodle>
  )
}

export function DoodleSquiggle(props: P) {
  return (
    <Doodle strokeWidth={2.4} {...props}>
      <path d="M2.5 12c2.5-3.5 5 3.5 7.5 0 2.5-3.5 5 3.5 7.5 0 1.2-1.7 2.6-1.3 4 .5" />
    </Doodle>
  )
}

export function DoodleHeart(props: P) {
  return (
    <Doodle {...props}>
      <path d="M12 20s-7.5-4.6-9-9c-1-3 1-6 4-6 2 0 4 1.5 5 3 1-1.5 3-3 5-3 3 0 5 3 4 6-1.5 4.4-9 9-9 9z" />
    </Doodle>
  )
}

export function IconCalendar(props: P) {
  return (
    <Doodle {...props}>
      <path d="M5 6.5h14a2 2 0 0 1 2 2V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8.5a2 2 0 0 1 2-2z" />
      <path d="M8 3.5v4M16 3.5v4" />
      <path d="M3.5 11h17" />
      <path strokeWidth={2.6} d="M8 15h.01M12 15h.01M16 15h.01M8 18h.01M12 18h.01" />
    </Doodle>
  )
}

export function IconBook(props: P) {
  return (
    <Doodle {...props}>
      <path d="M12 6.5C10 5 7 4.5 4 4.5v14c3 0 6 .6 8 2 2-1.4 5-2 8-2v-14c-3 0-6 .5-8 2z" />
      <path d="M12 6.5v14" />
    </Doodle>
  )
}

export function IconBandage(props: P) {
  return (
    <Doodle {...props}>
      <g transform="rotate(-35 12 12)">
        <rect x="3.5" y="8.5" width="17" height="7" rx="3.5" />
        <path strokeWidth={2.6} d="M9.5 11.5h.01M14.5 11.5h.01M12 9.7h.01M12 13.3h.01" />
      </g>
    </Doodle>
  )
}

export function IconChart(props: P) {
  return (
    <Doodle strokeWidth={2.2} {...props}>
      <path d="M4.5 19.5v-6" />
      <path d="M12 19.5v-11" />
      <path d="M19.5 19.5v-8" />
      <path d="M3 19.5h18" strokeWidth={2} opacity={0.5} />
    </Doodle>
  )
}

export function IconSmiley(props: P) {
  return (
    <Doodle {...props}>
      <path d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z" />
      <path strokeWidth={2.6} d="M9 10h.01M15 10h.01" />
      <path d="M8.5 14c1 1.3 2.2 2 3.5 2s2.5-.7 3.5-2" />
    </Doodle>
  )
}

export function IconSpeaker(props: P) {
  return (
    <Doodle {...props}>
      <path d="M4 9.5v5h3.5l5 4v-13l-5 4H4z" />
      <path d="M15.5 9.5a4 4 0 0 1 0 5" />
      <path d="M18 7.5a7.2 7.2 0 0 1 0 9" />
    </Doodle>
  )
}

export function IconCheck(props: P) {
  return (
    <Doodle strokeWidth={2.4} {...props}>
      <path d="M4.5 12.5l4.5 4.5L19.5 7" />
    </Doodle>
  )
}

export function IconX(props: P) {
  return (
    <Doodle strokeWidth={2.4} {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Doodle>
  )
}

export function IconArrowLeft(props: P) {
  return (
    <Doodle {...props}>
      <path d="M19 12H5" />
      <path d="M10.5 6.5L5 12l5.5 5.5" />
    </Doodle>
  )
}

export function IconArrowRight(props: P) {
  return (
    <Doodle {...props}>
      <path d="M5 12h14" />
      <path d="M13.5 6.5L19 12l-5.5 5.5" />
    </Doodle>
  )
}

export function IconPlus(props: P) {
  return (
    <Doodle strokeWidth={2.4} {...props}>
      <path d="M12 5v14M5 12h14" />
    </Doodle>
  )
}

export function IconMinus(props: P) {
  return (
    <Doodle strokeWidth={2.4} {...props}>
      <path d="M5 12h14" />
    </Doodle>
  )
}

export function IconPencil(props: P) {
  return (
    <Doodle {...props}>
      <path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1z" />
    </Doodle>
  )
}
