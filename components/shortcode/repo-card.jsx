import Link from 'next/link'
import React from 'react'

import remark from 'remark'
import gemoji from 'remark-gemoji'

function parseMarkdownSimple(text) {
  const parsed = remark().use(gemoji).processSync(text)
  return parsed.toString()
}

async function get(url) {
  const resp = await fetch(url)
  if (resp.status !== 200) {
    throw new Error(`Got response ${resp.status} from the API while fetching ${url}`)
  }
  return resp.json()
}

export default class RepoCard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loadedData: undefined,
      colors: {},
    }
  }

  async componentDidMount() {
    const { username, reponame } = this.props
    if (!username || !reponame) {
      return
    }
    const colors = await get(
      'https://raw.githubusercontent.com/ozh/github-colors/master/colors.json'
    )
    colors['Unknown'] = {
      color: '#565656',
      url: 'https://github.com/',
    }
    this.setState({ colors })

    try {
      const data = await get(`https://api.github.com/repos/${username}/${reponame}`)
      this.setState({ loadedData: data })
    } catch (e) {
      const data = {
        html_url: `https://github.com/${username}/${reponame}`,
        description: 'Failed to load repository info...',
        name: reponame,
        owner: {
          login: username,
        },
        stargazers_count: 0,
        forks: 0,
        language: 'Unknown',
      }
      this.setState({ loadedData: data })
    }
  }

  render() {
    const { loadedData } = this.state
    if (typeof loadedData === 'undefined') {
      return null
    }

    return (
      <div className="border border-gray-100 rounded-md bg-gray-200 p-4 text-sm leading-normal text-gray-800 dark:text-gray-200 dark:bg-gray-800 dark:border-gray-900">
        <div className="flex items-center">
          <svg
            style={{ fill: '#606a75', marginRight: '8px' }}
            viewBox="0 0 16 16"
            version="1.1"
            width={16}
            height={16}
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
            ></path>
          </svg>
          <span className="font-semibold" style={{ color: '#0366d6' }}>
            <a
              className="text-gray-500 no-underline hover:underline"
              href={loadedData.html_url}
              style={{ textDecoration: 'none !important' }}
            >
              {loadedData.owner.login + '/' + loadedData.name}
            </a>
          </span>
        </div>
        {loadedData.fork && (
          <>
            <div className="text-xs text-gray-500">
              Forked from{' '}
              <Link
                className="hover:underline"
                style={{ textDecoration: 'none !important' }}
                href={loadedData.source.html_url}
              >
                {loadedData.source.full_name}
              </Link>
            </div>
          </>
        )}
        <div className="text-xs mb-4 mt-2 text-gray-500">
          {parseMarkdownSimple(loadedData.description)}
        </div>
        <div className="text-xs text-gray-500 flex">
          {loadedData.language && (
            <div className="mr-4 gap-2">
              <span
                className="w-3 h-3 rounded-full inline-block top-[1px] relative"
                style={{ backgroundColor: this.state.colors[loadedData.language].color }}
              />
              <span className="ml-1">{loadedData.language}</span>
            </div>
          )}
          {loadedData.stargazers_count > 0 && (
            <>
              <div className="flex items-center mr-4">
                <svg
                  style={{ fill: '#FBCA04' }}
                  aria-label="stars"
                  viewBox="0 0 16 16"
                  version="1.1"
                  width={16}
                  height={16}
                  role="img"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z"
                  />
                </svg>
                &nbsp; <span>{loadedData.stargazers_count.toLocaleString()}</span>
              </div>
            </>
          )}
          {loadedData.forks > 0 && (
            <div className="flex items-center">
              <svg
                style={{ fill: '#586069' }}
                aria-label="fork"
                viewBox="0 0 16 16"
                version="1.1"
                width={16}
                height={16}
                role="img"
              >
                <path
                  fillRule="evenodd"
                  d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"
                >
                  <title>Forks</title>
                </path>
              </svg>
              &nbsp; <span>{loadedData.forks.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    )
  }
}
