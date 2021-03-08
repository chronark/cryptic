import { NextPage } from "next"
import { useRouter } from "next/router"
import React, { useState, useEffect } from "react"
import { AES, enc } from "crypto-js"
import { Spinner } from "../../components/spinner"
import { Footer } from "../../components/footer"
const inputStyle =
  "block w-full font-mono text-gray-700 px-4 py-3 border-2 border-gray-200 rounded focus:border-transparent focus:ring-2 focus:ring-rose-400 focus:outline-none focus:shadow-xl"

enum State {
  IDLE,
  POSTING,
  SUCCESS,
  ERROR,
}

export const Unseal: NextPage = (): JSX.Element => {
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
                      {state === State.POSTING ? <Spinner /> : "Unseal"}
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </section>
      <Footer />
    </div>
  )
}

export default Unseal
