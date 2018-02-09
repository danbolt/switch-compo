var fs = require('fs');

var mapListing = ['crouching1',
'crouching2',
'crouching3',
'interlude1',
'psi1',
'psi2',
'psi3',
'interlude2',
'synthesis1',
'synthesis2',
'synthesis3',
'systhesis4',
'interlude3',
'finalpuzzle',
'interlude4',
'interlude5',
'the_goddess',
'interlude6',
'overcoming',
'leaving_ruins',
'green'];

fs.readFile('dummy.json', { encoding: 'utf-8', flag: 'r'}, (err, data) => {
  if (err) {
    throw err;
  }

  mapListing.forEach((listing, index) => {
    var newData = data;
    if (index > 0) {
      newData = data.replace('map1', mapListing[index - 1]);
    }

    if (index < mapListing.length - 1) {
      newData = newData.replace('map2', mapListing[index + 1]);
    }

    //console.log(newData);
    fs.writeFile(listing + '.json', newData, 'utf8', (err) => { if (err) {throw err;} console.log(listing + ' saved'); });
  });
});

