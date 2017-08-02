var express = require('express');
var app = express();
var request = require('request');
var fs = require('fs');

app.set('port', (process.env.PORT || 5555));



app.get('/:name', function (req, res) {

    var options = {
        root: __dirname + '/view/',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };

    var fileName = req.params.name;
    res.sendFile(fileName, options, function (err) {
        if (err) {
            // console.log(err);
        } else {
            console.log('Sent:', fileName);
        }
    });
});

app.post('/proxy',function(req,res){
    if(req.query.url){
        var url = req.query.url
        request(url).pipe(fs.createWriteStream('./view/test.html'));
    }
    res.end();
})

app.listen(app.get('port'), function () {
    console.log('app at port:- ' + app.get('port'));
});