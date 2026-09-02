import { Slot as SlotPrimitive } from '@radix-ui/react-slot'

type WithAsChild<T = object> = T & {
  asChild?: boolean
}

const Slot = SlotPrimitive

export { Slot, type WithAsChild }
