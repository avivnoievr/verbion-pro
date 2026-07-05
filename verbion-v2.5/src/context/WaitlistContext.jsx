import { createContext, useContext, useState } from 'react'

const WaitlistCtx = createContext(null)

export function WaitlistProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <WaitlistCtx.Provider value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}>
      {children}
    </WaitlistCtx.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useWaitlist = () => useContext(WaitlistCtx)
