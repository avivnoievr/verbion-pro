const key = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const isLocalHost = ['localhost', '127.0.0.1'].includes(window.location.hostname)

// pk_test keys belong to a Clerk DEV instance and are only authorized on
// localhost — mounting ClerkProvider with one on a real domain crashes
// clerk-js and takes the whole React tree down (black screen). Only
// enable Clerk where the key can actually work: any host with a
// pk_live key, localhost with anything.
let runtimeFailed = false
export const markClerkFailed = () => { runtimeFailed = true }
export const isClerkEnabled = () =>
  Boolean(key) && (isLocalHost || key.startsWith('pk_live_')) && !runtimeFailed
export const CLERK_ENABLED = Boolean(key) && (isLocalHost || key.startsWith('pk_live_'))
