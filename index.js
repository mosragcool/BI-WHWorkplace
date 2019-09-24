express = require('express'),
    bodyParser = require('body-parser'),

    app = express().use(bodyParser.json()); // creates express http server

// Sets server port and logs message on success
app.listen(process.env.PORT || 1234, () => console.log('webhook is listening'));
var service_host =  '10.17.1.32';
var service_port = '9862';
var TypeMessage_Text = "Text";
var TypeMessage_Generic = "Generic";
var botName = "@OFMOpBot";

// Creates the endpoint for our webhook



app.post('/BI/webhook', (req, res) => {

    try {


        let body = req.body;

        // console.log(body);


        if (body.object === 'page') {




            body.entry.forEach(function(entry) {

                let webhook_event = entry.messaging[0];

                if (webhook_event.message && webhook_event.message.text) {

                    if (webhook_event.thread) {


                        var sender_psid = webhook_event.thread.id;
                        var splitNameBot = webhook_event.message.text.split(botName);
                        if (splitNameBot.length > 1) {
                            var Message = splitNameBot[1]; //.replace(/ /g,'')
                        }
                        ProcessMessage(sender_psid, Message);
                    } else {
                        sender_psid = webhook_event.sender.id;

                        var Message = webhook_event.message.text;
                        ProcessMessage(sender_psid, Message);
                    }
                } else if (webhook_event.postback) {
                
                   var splitMessage = webhook_event.postback.payload.split(',');

                    var sender_psid = splitMessage[0];
                    var Message = splitMessage[1];
                    ProcessMessage(sender_psid, Message);

                }
                //  else console.log('No property Message');

                //}
                // else console.log('No property Message');
            });

            // Returns a '200 OK' response to all requests
            res.status(200).send('EVENT_RECEIVED');
        } else {
            // Returns a '404 Not Found' if event is not from a page subscription
            res.sendStatus(404);
        }


    } catch (express) {
        console.log('Post Web Hook : ' + express);
    }

});




function ProcessMessage(sender_psid, message) {

    try {

        var CountSpace = 0;
        for (let index = 0; index < message.length; index++) {

            if (message[index] == ' ') CountSpace++; // message =  message.slice(0,0);
            else break;

        }

        if (CountSpace != 0) message = message.slice(CountSpace, message.length);




        var command = message.split(' ');
        var empty = "คำถามไม่ถูกตรงตามรูปแบบ ต้องระบุเป็น Ex. Sales store, Store= Code ,Number,Short name";

        if (command.length > 0 && command.length == 1) {


            if (command[0].toUpperCase() === 'S' || command[0] === 'ยอดขาย' || command[0].toUpperCase() === 'SALES' || command[0].toUpperCase() === 'SALE') {


                var options = {
                    host: service_host,
                    port: service_port,
                    path: '/api/v1/Sales/GetDistrict',
                    method: "GET"
                }

                var http = require('http');


                var req = http.request(options, function(res) {
                    res.setEncoding('utf8');

                    res.on('data', function(chunk) {

                        SendMessage(TypeMessage_Generic, sender_psid, chunk);



                    });
                });
                req.end();



            } else {
                SendMessage(TypeMessage_Text, sender_psid, empty);
            }


        } else if (command.length > 1) {



            if (command[0].toUpperCase() === 'S' || command[0] === 'ยอดขาย' || command[0].toUpperCase() === 'SALES' || command[0].toUpperCase() === 'SALE') {
                var request_body = JSON.stringify({

                    "message": command[1]

                });


                var options = {
                    host: service_host,
                    port: service_port,
                    path: '/api/v1/Sales/GetSales',
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Content-Lenght": Buffer.byteLength(request_body)
                    }
                }

                var http = require('http');


                var req = http.request(options, function(res) {
                    res.setEncoding('utf8');

                    res.on('data', function(chunk) {
                        SendMessage(TypeMessage_Text, sender_psid, chunk);



                    });
                });
                req.write(request_body);
                req.end();
            } else if (command[0].toUpperCase() === 'LOC' || command[0].toUpperCase() === 'LOCATION') {
                var stext = '';

                for (i = 1; i < command.length; i++) {
                    stext += command[i] + ' ';
                }

                stext = stext.substring(0, stext.length - 1);

                //  console.log('stext : '+stext);

                var request_body = JSON.stringify({

                    "message": stext

                });

                var options = {
                    host: service_host,
                    port: service_port,
                    path: '/api/v1/Stock/GetStock_ByArea',
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Content-Lenght": Buffer.byteLength(request_body)
                    }
                }

                var http = require('http');


                var req = http.request(options, function(res) {
                    res.setEncoding('utf8');

                    res.on('data', function(chunk) {
                        SendMessage(TypeMessage_Text, sender_psid, chunk);



                    });
                });
                req.write(request_body);
                req.end();
            } else if (command[0].toUpperCase() === 'STOCK') {
                var stext = '';

                for (i = 1; i < command.length; i++) {
                    stext += command[i] + ' ';
                }

                stext = stext.substring(0, stext.length - 1);

                //  console.log('stext : '+stext);

                var request_body = JSON.stringify({

                    "message": stext

                });



                var options = {
                    host: service_host,
                    port: service_port,
                    path: '/api/v1/Stock/GetSotck_ByLoc',
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Content-Lenght": Buffer.byteLength(request_body)
                    }
                }

                var http = require('http');


                var req = http.request(options, function(res) {
                    res.setEncoding('utf8');

                    res.on('data', function(chunk) {
                        SendMessage(TypeMessage_Text, sender_psid, chunk);



                    });
                });
                req.write(request_body);
                req.end();
            } else if (command[0].toUpperCase() === 'DISTRICT') {



                var options = {
                    host: service_host,
                    port: service_port,
                    path: '/api/v1/Sales/GetStore?DistrictID=' + command[1],
                    method: "GET"

                }



                var http = require('http');


                var req = http.request(options, function(res) {
                    res.setEncoding('utf8');

                    res.on('data', function(chunk) {
                        SendMessage(TypeMessage_Generic, sender_psid, chunk);



                    });
                });
                req.end();



            }
            else if (command[0].toUpperCase() === 'CALL') {
                SendMessage(TypeMessage_Text, sender_psid, "กำลังทำจ้า");
            }
            else  if (command[0].toUpperCase() === 'HELP') {
                SendMessage(TypeMessage_Text, sender_psid, "กำลังทำจ้า");
            }
            else {
                SendMessage(TypeMessage_Text, sender_psid, empty);
            }

        } else {
            SendMessage(TypeMessage_Text, sender_psid, empty);
        }




    } catch (express) {
        console.log('ProcessMessage :' + express);
    }


}

function SendMessage(type, sender_psid, Message) {
    // Construct the message body
    try {
        var arrayMessage = [];
        var request_body = ''
        if (type === TypeMessage_Generic) {


            var Value = JSON.parse(Message);

            if (Value && Value.length > 0) {


                let countroop = Math.floor(Value.length / 10);

                if (Value.length % 10 != 0) countroop++;

                for (let j = 0; j < countroop; j++) {
                    request_body = ''
                    var data = '';
                    for (i = 0; i < 10; i++) {

                        let index = (j * 10) + i;

                        if (index == Value.length) break;


                        data += '{ "title": "' + Value[index]['title'] + '","image_url": "' + Value[index]['image_url'] +
                            '","subtitle": "' + Value[index]['subTitle'] + '"';
                        //  +'","default_action":{"type":"'
                        //  +Value[index]['default_action']['type']+'","url": "'+Value[index]['default_action']['url']
                        //  +'","webview_height_ratio": "'+Value[index]['default_action']['webview_height_ratio']+'"}';

                        if (Value[index]['button']['type'] === 'postback') {
                            data += ',"buttons": [{"type":"' + Value[index]['button']['type'] 
                            + '","title":"' + Value[index]['button']['title'] 
                            + '","payload":"' +sender_psid+","+ Value[index]['button']['payload'] + '"}]';
                        }

                        data += '}';

                        if (index != 10 && index != Value.length - 1) data += ",";
                    }
                    data = "[" + data + "]";


                    if (sender_psid.search('t_') > -1) {
                        request_body = JSON.stringify({
                            "messaging_type": "RESPONSE",
                            "recipient": {
                                "thread_key": sender_psid
                            },
                            "message": {
                                "attachment": {
                                    "type": "template",
                                    "payload": {
                                        "template_type": "generic",
                                        "image_aspect_ratio": "square",
                                        "elements": data
                                    }
                                }
                            }
                        });

                    } else {

                        request_body = JSON.stringify({
                            "messaging_type": "RESPONSE",
                            "recipient": {
                                "id": sender_psid
                            },
                            "message": {
                                "attachment": {
                                    "type": "template",
                                    "payload": {
                                        "template_type": "generic",
                                        "image_aspect_ratio": "square",
                                        "elements": data
                                    }
                                }
                            }

                        });
                    }
                    arrayMessage.push(request_body);

                }


            }

        } else {
            if (sender_psid.search('t_') > -1) {

                request_body = JSON.stringify({
                    "messaging_type": "RESPONSE",
                    "recipient": {
                        "thread_key": sender_psid
                    },
                    "message": {
                        "text": Message
                    }
                });
            } else {

                request_body = JSON.stringify({
                    "messaging_type": "RESPONSE",
                    "recipient": {
                        "id": sender_psid
                    },
                    "message": {
                        "text": Message
                    }
                });
            }

            arrayMessage.push(request_body);
        }


        arrayMessage.forEach(element => {
            setTimeout(function() {

                var options = {
                    host: "graph.facebook.com",
                    path: "/v4.0/me/messages?access_token=DQVJ0WXM1NFVCc2xvRTVLZAU9wMjJCVGlGdlZAmRWdWUzVzMDJmekVnSS1hbHdOaVVFV3cwa2FYbnZAxX0NnOU9OX0l1R3c5cmtuVTkxSmxuc2QtX2NwdGw3SzRKS3Q4NU9YbEtsMmp1azBhdGFHcVFOak1faGdNUDlCMVgxc3ZAqMFhqd2RjQXhGRFlzTjRITEtnMDVYeC1qVEtKd2NZAZATZAPZAzN1MHJ2YjRqb1pSb0w1LUlkV0s0QUYzYmxzZA1pTWXF0dldDWW9R",
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Content-Lenght": Buffer.byteLength(element)
                    }
                }

                var https = require('https');


                var req = https.request(options, function(res) {
                    res.setEncoding('utf8');
                    res.on('data', function(chunk) {
                        console.log('Complete : ' + chunk);
                    });
                })
                req.write(element);
                req.end();

            }, 1000);
        });



    } catch (express) {
        console.log('SendMessage :' + express);
    }

}





app.get('/BI/webhook', (req, res) => {


    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = "B4wHhfBcfs7d5nP1dp9t7qn4053n9oG4"
    console.log('GetWebHook');
    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            // Responds with the challenge token from the request
            //console.log(PAGE_ACCESS_TOKEN);
            //console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
});