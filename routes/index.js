/*
 * GET MP3 files.
 */

exports.index = function(req, res) {
    res.render('index', { title : 'Youtube Downloader MP3' });    
};

exports.get = function(req, res) {
    var ffmpeg = require('ffmpeg-node')
      , youtubedl = require('youtube-dl')
      , fs = require('fs')
      , youtube = require('youtube-feeds');

 
    var youtube_id = req.params.youtube_id
      , ytb_path = '/tmp/';
   
    youtube.httpProtocol = 'https';
     
    fs.exists(ytb_path + youtube_id + '.mp3', function(exists) {        
        if (exists) {
            console.log('Exist!');
            res.end('File ready!');
        }
        else {
            youtube.video(youtube_id, function (err, data) {
                if (err) {
                    res.end(err.message);
                }
                else if (typeof data.duration !== 'undefined' && data.duration < 600) {
                    startDownload();
                }
                else {
                    res.end('There is a problem of copyright or time exceeds 10 minutes');
                }
            });
        }
    }); 
    
    var startDownload = function () {
        var dl = youtubedl.download(youtube_id,
                                    ytb_path,
                                    ['--format=worst', '--output=%(id)s.ytb']);

        /*
        dl.on('download', function(data) {
            console.log('Download started');
            console.log('filename: ' + data.filename);
            console.log('size: ' + data.size);
        });

        // will be called during download progress of a video
        dl.on('progress', function(data) {
            console.log('...');
            process.stdout.write(data.eta + ' ' + data.percent + '% at ' + data.speed + '\r');
        });
        */
        // catches any errors
        dl.on('error', function(err) {
            dl.removeAllListeners('end');
            res.end(err.message);
            console.log(err);
        });

        // called when youtube-dl finishes
        dl.on('end', function(data) {
          console.log('[DOWNLOAD] successful!');
          ffmpeg.mp3(ytb_path + youtube_id + '.ytb', ytb_path + youtube_id + '.mp3',
                        function(err, out, code) {
                            if (code == 0) {
                                console.log('[CONVERSION] successful!');
                                res.end('[CONVERSION] successful!');    
                            }
                            else {
                                console.log('[CONVERSION] errors');
                                console.log(err);
                                res.end('[CONVERSION] errors');
                            }
                        });

            
          console.log('Filename: ' + data.filename);
          console.log('Size: ' + data.size);
          console.log('Time Taken: ' + data.timeTaken);
          console.log('Time Taken in ms: ' + data.timeTakenms);
          console.log('Average Speed: ' + data.averageSpeed);
          console.log('Average Speed in Bytes: ' + data.averageSpeedBytes);
        });
    }

};
