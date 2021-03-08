import "tailwindcss/tailwind.css"
import React from "react"
import { AppProps } from "next/app"
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return <Component {...pageProps} />
}

export default MyApp
