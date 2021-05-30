import { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { useRouter } from 'next/router'
import Link from 'next/link'

const LanguageKey = (props) => {
  let styling = 'p-2 rounded-lg'
  let selLink = props.route
  if (props.index > 0) {
    styling += ' mt-2'
  }
  if (props.currentLocale === props.locale) {
    styling += ' bg-gray-700 cursor-default'
    selLink = '#'
  } else {
    styling += ' bg-gray-800 hover:bg-gray-700 transition'
  }
  const localeName = new Intl.DisplayNames([props.locale, 'en'], { type: 'language' })
  return (
    <li className={styling}>
      {selLink === '#' ? (
        <span className="select-none">{localeName.of(props.locale)}</span>
      ) : (
        <Link href={selLink} locale={props.locale}>
          {localeName.of(props.locale)}
        </Link>
      )}
    </li>
  )
}

const LangSwitch = () => {
  const [mounted, setMounted] = useState(false)
  const [hovered, setHovered] = useState(false)
  const intl = useIntl()
  const router = useRouter()
  const defaultLang = intl.defaultLocale

  // When mounted on client, now we can show the UI
  useEffect(() => setMounted(true), [])

  return (
    <div className="inline-block relative align-top">
      <button
        aria-label="Toggle Language Switcharoo"
        type="button"
        className="h-8 p-1 ml-1 mr-1 rounded sm:ml-4 focus:outline-none hover:opacity-80 duration-150 font-semibold"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <p>Aあ</p>
      </button>
      <ul
        id="dropdown_lang_menu"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`list-none absolute right-0 top-full bg-gray-800 p-4 rounded-lg transition ${
          hovered ? 'opacity-100' : 'opacity-0 invisible'
        }`}
      >
        {router.locales.map((locale, idx) => {
          return (
            <LanguageKey
              key={`locale-${locale}`}
              index={idx}
              locale={locale}
              currentLocale={router.locale}
              route={router.route}
            />
          )
        })}
      </ul>
    </div>
  )
}

export default LangSwitch
