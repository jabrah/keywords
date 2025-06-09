// Methods and jQuery UI for Wax search box
function excerptedString(str) {
  str = str || ''; // handle null > string
  if (str.length < 40) {
    return str;
  }
  else {
    return `${str.substring(0, 40)} ...`;
  }
}

function getThumbnail(item, url) {
  if ('thumbnail' in item) {
    return `<img class='sq-thumb-sm' src='${url}${item.thumbnail}'/>&nbsp;&nbsp;&nbsp;`
  }
  else {
    return '';
  }
}

function getSnippet(item, fields, metadata) {
  return metadata
    .filter(subtitle => fields.includes(subtitle) && item[subtitle])
    .map((subtitle) => {
      let label = subtitle.replaceAll('_', ' ');
      label = `${label.charAt(0).toUpperCase()}${label.slice(1)}`
      return `<b>${label}</b>: ${item[subtitle]}`;
    })
    .join(' | ');
}

function displayResult(item, fields, url, subtitles) {
  var pid   = item.pid;
  var label = item.label || 'Untitled';
  var link  = item.permalink;
  var thumb = getThumbnail(item, url);

  const result = `
  <div class="result">
    <a class="result-link" href="${link}">
      <span class="result-thumbnail">${thumb}</span>
      <div class="w-100">
        <div class="title">${item.label}</div>
        <div class="meta text-truncate">
          ${getSnippet(item, fields, subtitles)}
        </div>
      </div>
    </a>
  </div>
  `;
  return result;
}

function startSearchUI(fields, indexFile, url, subtitles) {
  $.getJSON(indexFile, function(store) {
    var index  = new elasticlunr.Index;

    index.saveDocument(false);
    index.setRef('lunr_id');

    for (let i in fields) { index.addField(fields[i]); }
    for (let i in store)  { index.addDoc(store[i]); }

    $('input#search').on('keyup', function() {
      var results_div = $('#results');
      var query       = $(this).val();
      var results     = index.search(query, { boolean: 'AND', expand: true });

      results_div.empty();
      results_div.append(`<p class="results-info">Displaying ${results.length} results</p>`);

      for (var r in results) {
        var ref    = results[r].ref;
        var item   = store[ref];
        var result = displayResult(item, fields, url, subtitles);

        results_div.append(result);
      }
    });
  });
}
