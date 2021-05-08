import Head from 'next/head'
import React from 'react'
import ReactGist from 'react-gist'

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min) + min) //The maximum is exclusive and the minimum is inclusive
}

class EmbeddedGist extends React.Component {
  constructor(props) {
    super(props)
    this.addStylesheet = this.addStylesheet.bind(this)
    this.id = props.id
    this.file = props.file
    this.stylesheetAdded = false
    this.state = {
      loading: true,
      src: '',
    }
  }

  // The Gist JSON data includes a stylesheet to add to the page
  // to make it look correct. `addStylesheet` ensures we only add
  // the stylesheet one time.
  addStylesheet(href) {
    if (!this.stylesheetAdded) {
      this.stylesheetAdded = true
      var link = document.createElement('link')
      link.type = 'text/css'
      link.rel = 'stylesheet'
      link.href = href

      document.head.appendChild(link)
    }
  }

  componentDidMount() {
    // Create a JSONP callback that will set our state
    // with the data that comes back from the Gist site
    var gistCallback = EmbeddedGist.nextGistCallback()
    window[gistCallback] = function (gist) {
      this.setState({
        loading: false,
        src: gist.div,
      })
      this.addStylesheet(gist.stylesheet)
    }.bind(this)
    var url = 'https://gist.github.com/' + this.props.id + '.json?callback=' + gistCallback
    if (this.props.file) {
      url += '&file=' + this.props.file
    }
    // Add the JSONP script tag to the document.
    var script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = url
    document.head.appendChild(script)
  }

  render() {
    if (this.state.loading) {
      return null
    } else {
      return (
        <>
          <Head>
            <link
              href="https://cdn.rawgit.com/lonekorean/gist-syntax-themes/848d6580/stylesheets/monokai.css"
              rel="stylesheet"
            />
            {/* Override some styling */}
            <style>
              {`
                .js-file-line-container > tbody > tr {
                  border-bottom-width: 0px !important;
                }

                [class=dark] .gist .gist-data {
                  background-color: #272822 !important;
                  border-color: #4e4e4e !important;
                }

                [class=dark] .gist {
                  color: #ddd;
                }

                [class=dark] .gist .gist-meta {
                    color: #d8d8d8;
                    background-color: #292929 !important;
                }

                [class=dark] .gist .gist-meta a {
                  color: #ddd;
                }

                [class=dark] .gist .gist-file {
                  border-color: #4e4e4e #4e4e4e #5e5e5e !important;
                }

                .gist .gist-file article {
                  padding: 1rem !important;
                }
                
                [class=dark] .gist .blob-num:hover {
                  color: rgb(145 148 150 / 60%) !important;
                }
              `}
            </style>
          </Head>
          <div dangerouslySetInnerHTML={{ __html: this.state.src }} />
        </>
      )
    }
  }
}
// Each time we request a Gist, we’ll need to generate a new
// global function name to serve as the JSONP callback.
var gistCallbackId = 0
EmbeddedGist.nextGistCallback = () => {
  return 'embed_gist_callback_' + gistCallbackId++
}
export default EmbeddedGist
