import { NextPage } from "next"
import { useRouter } from "next/router"
import React, { useState, useEffect } from "react"
import Link from "next/link"
import { AES, enc } from "crypto-js"

const inputStyle =
  "block w-full font-mono text-gray-700 px-4 py-3 border-2 border-gray-200 rounded focus:border-transparent focus:ring-2 focus:ring-rose-400 focus:outline-none focus:shadow-xl"

const spinner = (
  <span className="flex items-center justify-center w-full h-full">
    <svg className="w-6 h-6 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  </span>
)

enum State {
  IDLE,
  POSTING,
  SUCCESS,
  ERROR,
}

export const Index: NextPage = (): JSX.Element => {
  const router = useRouter()
  const [state, setState] = useState<State>(State.IDLE)
  const [id, setID] = useState<string>(null)
  const [key, setKey] = useState<string>(null)
  const [content, setContent] = useState("")
  const [remainingViews, setRemainingViews] = useState(1)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    console.log(router.query)
    setID(router.query.id as string)
    setKey(router.query.key as string)
  }, [router])

  const loadDocument = async () => {
    if (state === State.POSTING) {
      return
    }
    setState(State.POSTING)
    const res = await fetch(`/api/unseal/${id}?key=${key}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
    if (!res.ok) {
      alert(`Something went wrong: ${JSON.stringify(res.body)}`)
      setState(State.ERROR)
      return
    }

    const { content: encrypted, remainingViews } = await res.json()
    console.log({ encrypted })
    setRemainingViews(remainingViews)
    setContent(AES.decrypt(encrypted, key).toString(enc.Utf8))

    setState(State.SUCCESS)
  }

  return (
    <div className="flex flex-col h-screen">
      <nav className="fixed z-50 w-screen px-8">
        <div className="relative flex flex-col flex-wrap items-center justify-center py-5 mx-auto md:flex-row max-w-7xl">
          <Link href="/">
            <a className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-tr from-rose-700 to-orange-500">
              Ephermeral Vault
            </a>
          </Link>

          <div className="items-center justify-center hidden w-full h-full py-5 -ml-0 space-x-12 text-base md:flex md:-ml-5 md:py-0 md:absolute">
            {[].map((link) => {
              return (
                <Link href={link.href} key={link.label}>
                  <a className="relative font-medium leading-6 text-gray-600 transition duration-150 ease-out hover:text-gray-900">
                    {link.label}
                  </a>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      <section className="container flex items-center justify-center h-screen px-4 py-16 mx-auto bg-white min-w-screen">
        {state === State.SUCCESS ? (
          <div className="flex flex-col items-center w-full space-y-2">
            <p className="w-full space-y-4 text-sm font-medium text-center text-gray-700">
              Thank you, have a great day!
            </p>
            <div className="relative flex items-center w-full h-auto p-2 border rounded shadow-xl border-rose-400">
              <div className="w-full h-auto p-6 font-mono text-gray-800 resize-none focus:outline-none">{content}</div>
              <button
                className="p-2 text-gray-900 transition duration-200 transform focus:outline-none hover:text-gray-700 hover:scale-110"
                onClick={(e) => {
                  const tmp = document.createElement("textarea")
                  tmp.innerText = content
                  document.body.appendChild(tmp)
                  tmp.select()
                  document.execCommand("copy")
                  e.currentTarget.focus()
                  setCopied(true)
                }}
              >
                {copied ? (
                  <svg
                    className="w-6 h-6 text-rose-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path
                      fillRule="evenodd"
                      d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 " fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                    <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                  </svg>
                )}
              </button>
            </div>

            <p className="w-full mt-2 text-center text-gray-700">
              {remainingViews >= 1
                ? "This document can be read another {remainingViews} times"
                : "This was the last time anyone can view this document"}
            </p>
          </div>
        ) : (
          <div className="w-full px-12 mx-auto md:px-16 xl:px-10">
            <div className="flex flex-col items-center lg:flex-row">
              <div className="w-full">
                <ul className="space-y-8 ">
                  <li>
                    <label htmlFor="documentID" className="text-sm font-medium text-gray-700">
                      Document ID
                    </label>
                    <input
                      type="text"
                      required
                      autoCorrect="false"
                      name="documentID"
                      className={inputStyle}
                      value={id}
                      onChange={(e) => setID(e.currentTarget.value)}
                    />
                  </li>
                  <li>
                    <label htmlFor="unsealKey" className="text-sm font-medium text-gray-700">
                      Unseal key
                    </label>
                    <input
                      type="string"
                      name="unsealKey"
                      autoCorrect="false"
                      className={inputStyle}
                      value={key}
                      onChange={(e) => setKey(e.currentTarget.value)}
                    />
                  </li>
                  <li>
                    <button
                      onClick={loadDocument}
                      className="inline-flex justify-center w-full px-8 py-3 font-medium leading-none text-center text-white no-underline bg-transparent rounded cursor-pointer hover:shadow-xl bg-gradient-to-tr focus-within:text-white sm:text-base md:text-lg from-rose-700 to-orange-500"
                    >
                      {state === State.POSTING ? spinner : "Unseal"}
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </section>
      <section className="fixed inset-x-0 bottom-0 text-gray-700 bg-white body-font">
        <div className="container flex flex-col items-center px-8 py-8 mx-auto max-w-7xl sm:flex-row">
          <p className="mt-4 text-sm text-gray-500 sm:ml-4 sm:pl-4 sm:mt-0">
            © {new Date().getUTCFullYear()} Andreas Thomas
          </p>
          <span className="inline-flex justify-center mt-4 space-x-5 sm:ml-auto sm:mt-0 sm:justify-start">
            <a href="https://vercel.com" className="flex items-center">
              <span>Deployed on</span>
              <span className="">
                <svg width="100" height="16" viewBox="0 0 283 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M141.04 16c-11.04 0-19 7.2-19 18s8.96 18 20 18c6.67 0 12.55-2.64 16.19-7.09l-7.65-4.42c-2.02 2.21-5.09 3.5-8.54 3.5-4.79 0-8.86-2.5-10.37-6.5h28.02c.22-1.12.35-2.28.35-3.5 0-10.79-7.96-17.99-19-17.99zm-9.46 14.5c1.25-3.99 4.67-6.5 9.45-6.5 4.79 0 8.21 2.51 9.45 6.5h-18.9zM248.72 16c-11.04 0-19 7.2-19 18s8.96 18 20 18c6.67 0 12.55-2.64 16.19-7.09l-7.65-4.42c-2.02 2.21-5.09 3.5-8.54 3.5-4.79 0-8.86-2.5-10.37-6.5h28.02c.22-1.12.35-2.28.35-3.5 0-10.79-7.96-17.99-19-17.99zm-9.45 14.5c1.25-3.99 4.67-6.5 9.45-6.5 4.79 0 8.21 2.51 9.45 6.5h-18.9zM200.24 34c0 6 3.92 10 10 10 4.12 0 7.21-1.87 8.8-4.92l7.68 4.43c-3.18 5.3-9.14 8.49-16.48 8.49-11.05 0-19-7.2-19-18s7.96-18 19-18c7.34 0 13.29 3.19 16.48 8.49l-7.68 4.43c-1.59-3.05-4.68-4.92-8.8-4.92-6.07 0-10 4-10 10zm82.48-29v46h-9V5h9zM36.95 0L73.9 64H0L36.95 0zm92.38 5l-27.71 48L73.91 5H84.3l17.32 30 17.32-30h10.39zm58.91 12v9.69c-1-.29-2.06-.49-3.2-.49-5.81 0-10 4-10 10V51h-9V17h9v9.2c0-5.08 5.91-9.2 13.2-9.2z"
                    fill="#000"
                  />
                </svg>
              </span>
            </a>
            <a href="https://github.com/chronark/cryptic" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">GitHub</span>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </a>
          </span>
        </div>
      </section>
    </div>
  )
}

export default Index
