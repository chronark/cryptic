import { NextPage } from "next"
import React, { useState } from "react"
import { AES, SHA256 } from "crypto-js"
import { v4 as uuid } from "uuid"
import { Spinner } from "../components/spinner"
import { Footer } from "../components/footer"

const inputStyle =
  "block w-full px-4 py-3 border-2 border-gray-200 rounded focus:border-transparent focus:ring-2 focus:ring-rose-400 focus:outline-none focus:shadow-xl"

const examples: string[] = [
  JSON.stringify({ hello: "world" }, null, 2),
  `# .env
TOKEN=${uuid()}`,
]

enum State {
  IDLE,
  POSTING,
  SUCCESS,
  ERROR,
}

export const Index: NextPage = (): JSX.Element => {
  const [state, setState] = useState<State>(State.IDLE)
  const [content, setContent] = useState("")
  const [remainingViews, setRemainingViews] = useState(1)
  const [copied, setCopied] = useState(false)
  const [copyURL, setCopyURL] = useState<string>(null)

  const createDocument = async () => {
    if (state === State.POSTING) {
      return
    }
    if (content === "") {
      alert("Come on, encrypting an empty message is no fun")
      return
    }

    setState(State.POSTING)
    const key = SHA256(content + uuid()).toString()

    const encryptedContent = AES.encrypt(content, key).toString()

    const res = await fetch("/api/seal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: encryptedContent,
        remainingViews,
      }),
    }).then((res) => res.json())
    setCopyURL(
      `${process.env.NODE_ENV === "production" ? "https://" : "http://"}${window.location.host}/unseal/${
        res.id
      }?key=${key}`,
    )
    console.log(res)
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
              <div className="w-full h-auto p-6 font-mono text-gray-800 resize-none focus:outline-none">{copyURL}</div>
              <button
                className="p-2 text-gray-900 transition duration-200 transform focus:outline-none hover:text-gray-700 hover:scale-110"
                onClick={(e) => {
                  const tmp = document.createElement("textarea")
                  tmp.innerText = copyURL
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

            <p className="w-full mt-2 text-center text-gray-700">Share this with someone</p>
          </div>
        ) : (
          <div className="px-12 mx-auto md:px-16 xl:px-10">
            <div className="flex flex-col items-center lg:flex-row">
              <div className="flex flex-col items-start justify-center w-full h-full pr-8 mb-10 lg:mb-0 lg:w-1/2">
                <p className="mb-2 text-base font-medium tracking-tight uppercase text-rose-500">
                  Share documents securely
                </p>
                <h2 className="text-4xl font-extrabold leading-10 tracking-tight text-gray-900 sm:text-5xl sm:leading-none md:text-6xl lg:text-5xl xl:text-6xl">
                  Share a secret
                </h2>
                <p className="my-6 text-lg text-gray-600">
                  Your document is encrypted in your browser before being stored for a limited period of time and read
                  operations. The data can only be decrypted with your key and we have no way of accessing it because
                  neither the unencrypted data nor your key leaves the browser.
                </p>
              </div>

              <div className="w-full lg:w-1/2">
                <ul className="space-y-8 ">
                  <li>
                    <label htmlFor="document" className="text-sm font-medium text-gray-700">
                      1. Write a secret message
                    </label>
                    <div className="w-full font-mono text-gray-800 palceholder-gray-600">
                      <textarea
                        required
                        autoCorrect="false"
                        name="document"
                        rows={3}
                        className={inputStyle}
                        value={content}
                        onChange={(e) => setContent(e.currentTarget.value)}
                        placeholder={examples[(examples.length * Math.random()) | 0]}
                      />
                    </div>
                  </li>
                  <li>
                    <label className="text-sm font-medium text-gray-700">
                      2. How many times should this be readable?
                    </label>
                    <input
                      type="number"
                      min={1}
                      className={inputStyle}
                      value={remainingViews}
                      onChange={(e) => setRemainingViews(e.currentTarget.valueAsNumber)}
                    />
                  </li>
                  <li>
                    <button
                      onClick={createDocument}
                      className="inline-flex justify-center w-full px-8 py-3 font-medium leading-none text-center text-white no-underline bg-transparent rounded cursor-pointer hover:shadow-xl bg-gradient-to-tr focus-within:text-white sm:text-base md:text-lg from-rose-700 to-orange-500"
                    >
                      {state === State.POSTING ? <Spinner /> : "Seal"}
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

export default Index
