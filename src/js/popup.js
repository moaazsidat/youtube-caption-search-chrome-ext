import React, { Component } from 'react';
import ReactDOM from 'react-dom';
// import { loadCaptions, search } from './utils';
import "../css/popup.css";

/*
Problem: 
because of the way chrome blocks fs and doesn't let you
interact with the python process, it's not possible to 
do this neatly, going to explore setting up a linux instance
and build and api around it and talk to it via the extension
*/

function getQueryParams(url) {
  var vars = [], hash;
  var hashes = url.slice(url.indexOf('?') + 1).split('&');
  for (var i = 0; i < hashes.length; i++) {
    hash = hashes[i].split('=');
    vars.push(hash[0]);
    vars[hash[0]] = hash[1];
  }
  return vars;
}

function secondsToHHMMSS(seconds) {
  var date = new Date(null);
  date.setSeconds(seconds); // specify value for SECONDS herelo
  return date.toISOString().substr(11, 8);
}

class Search extends Component {
  constructor() {
    super();
    this.state = {
      searchTerm: '',
    }
  }

  onSubmit = (e) => {
    e.preventDefault();
    this.props.search(this.state.searchTerm); 
  }
  
  onChange = (e) => {
    this.setState({
      searchTerm: e.target && e.target.value,
    })
  }

  render() {
    const { url, searchResults, videoId } = this.props;
    if (url.length === 0 || url.indexOf('https://www.youtube.com/') === -1) {
      return <div>You must be on a youtube video page</div>
    } else {
      const results = searchResults.map((s) => (
        <div style={{
          padding: '1em 0.2em',
          borderBottom: '1px solid #ccc',
        }}>
          Found at <a 
            href={`https://youtu.be/${videoId}?t=${parseInt(s.start/1000, 10)}s`}
            target="_blank"
          >{secondsToHHMMSS(parseInt(s.start / 1000, 10))}</a>.
          <div style={{
            marginTop: '0.5em',
            fontSize: '0.875em'
          }}>Matched caption part: {s.part}</div>
        </div>
      ))
      return (
        <div>
          <h4>{videoId}</h4>
          <form onSubmit={this.onSubmit} style={{marginBottom: '1em'}}>
            <input
              type="search"
              value={this.state.searchTerm}
              onChange={this.onChange}
            />
            <button type="submit">Search</button>
          </form>
          {
            searchResults.length > 0 && 
            <div>
              <div>Results for "{this.state.searchTerm}"</div>
              {results}
            </div>
          }
        </div>
        
      );
    }
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      url: '',
      searchResults: [],
    }
  }

  onSearch = (term) => {
    this.setState({
      searchResults: search(term)
    })
  }
  
  getTabs = (tabs) => {
    var url = tabs[0] && tabs[0].url || '';
    var qParams = getQueryParams(url)
    var videoId = qParams && qParams.v;
    this.setState({
      url: url,
      videoId: videoId || '',
    })
    // if ((!url.length === 0) && (!url.indexOf('https://www.youtube.com/') === -1) && videoId) {
    //   loadCaptions(this.state.videoId);
    // } else {
    //   console.log('not youtube video');
    // }
  }
  componentDidMount() {
    console.log('componetDidMount')
    chrome.tabs.query({ currentWindow: true, active: true }, this.getTabs)
  }
  render() {
    console.log('this.state.url', this.state.url);
    return (
      <div className="PopupContainer">
        <h3>Youtube caption search</h3>
        <div style={{ marginBottom: '1em' }}>{this.state.url}</div>
        <Search 
          url={this.state.url} 
          videoId={this.state.videoId}
          search={this.onSearch}
          searchResults={this.state.searchResults}
        />
      </div>
    )
  }
}


ReactDOM.render(<App />, document.getElementById('root'));

