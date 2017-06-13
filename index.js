
/*
var path = require('path');
var file = '/home/user/dir/file.txt';

var filename = path.parse(file).base;

*/
var path = require('path');

var AWS = require('aws-sdk');
var s3 = new AWS.S3({
    apiVersion: '2006-03-01'
});

var eltr = new AWS.ElasticTranscoder({
    apiVersion: '2012-09-25',
    region: 'us-east-1'
});

var pipelineId = '1496179160661-ij8s8u';
var webPreset = '1351620000001-300010';

exports.handler = function(event, context) {
    console.log('Received event:', JSON.stringify(event, null, 2));

    // Get the object from the event and show its content type
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const params = {
        Bucket: bucket,
        Key: key,
    };

    s3.getObject({
            Bucket: bucket,
            Key: key
        },
        function(err, data) {
            console.log('data::: ' + data);
            if (err) {
                console.log('Error getting object' + key + 'from bucket' + bucket +
                    '. Make sure they exist and your bucket is in the same region as this function.');
                context.done('ERROR', 'Error getting file' + err);
            } else {
                //console.log('Reached B');
                /* Below section can be used if you want to put any check based on metadata

                if (data.Metadata.Content-Type == 'video/x-msvideo') {
                console.log('Reached C' );
                console.log('Found new video: ' + key + ', sending to ET');
                sendVideoToET(key);
                } else {
                console.log('Reached D' );
                console.log('Upload ' + key + 'was not video');
                console.log(JSON.stringify(data.Metadata));
                }
                */
                sendVideoToET(key);
            }
        }
    );
};

function sendVideoToET(key) {
	var filename = path.parse(key).base;
	console.log('filename: ' + filename);
    console.log('Sending ' + key + ' to ET');

	webPreset = process.env.ETPRESET_ID

    console.log('webPreset: ' + webPreset);

    var params = {
        PipelineId: pipelineId,
        OutputKeyPrefix: 'out/',
        Input: {
            Key: key,
            FrameRate: 'auto',
            Resolution: 'auto',
            AspectRatio: 'auto',
            Interlaced: 'auto',
            Container: 'auto'
        },

        Output: {
            Key: 'transcoded_' + filename,
            PresetId: webPreset,
            Rotate: 'auto'
        }
    };

    eltr.createJob(params, function(err, data) {
        if (err) {
            console.log('Failed to send new media ' + key + ' to ET');
            console.log(err);
            console.log(err.stack)
        } else {
            //console.log('Error');
            console.log(data);
        }
        //context.done(null,”);
    });
}