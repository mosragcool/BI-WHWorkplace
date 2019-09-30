express = require('express'),
    bodyParser = require('body-parser'),

    app = express().use(bodyParser.json()); // creates express http server

// Sets server port and logs message on success
app.listen(process.env.PORT || 1234, () => console.log('webhook is listening'));
var service_host =  '10.17.1.32';
var service_port = '9862';
var apifacebook_host = 'graph.facebook.com';
var apifacebook_path = '/v4.0/me/messages?access_token=DQVJ0WXM1NFVCc2xvRTVLZAU9wMjJCVGlGdlZAmRWdWUzVzMDJmekVnSS1hbHdOaVVFV3cwa2FYbnZAxX0NnOU9OX0l1R3c5cmtuVTkxSmxuc2QtX2NwdGw3SzRKS3Q4NU9YbEtsMmp1azBhdGFHcVFOak1faGdNUDlCMVgxc3ZAqMFhqd2RjQXhGRFlzTjRITEtnMDVYeC1qVEtKd2NZAZATZAPZAzN1MHJ2YjRqb1pSb0w1LUlkV0s0QUYzYmxzZA1pTWXF0dldDWW9R';
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
    
              var sender_id = webhook_event.sender.id;
            
                if (webhook_event.message && webhook_event.message.text) {
                var Message = '';
              
                var recipient_id = '';
                    if (webhook_event.thread) {


                        recipient_id = webhook_event.thread.id;
                        var splitNameBot = webhook_event.message.text.split(botName);
                        if (splitNameBot.length > 1) {
                             Message = splitNameBot[1]; //.replace(/ /g,'')
                             ProcessMessage(sender_id,recipient_id, Message);
                        }
                       
                       
                    } else {
                        recipient_id = webhook_event.sender.id;
                         Message = webhook_event.message.text;
                        ProcessMessage(sender_id,recipient_id, Message);
                    }
                } else if (webhook_event.postback) {
                
                   var splitMessage = webhook_event.postback.payload.split(',');

                   recipient_id = splitMessage[0];
                     Message = splitMessage[1];
                    ProcessMessage(sender_id,recipient_id, Message);

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

function CallAPI(sTypeCall, sHost, sPort, sPath, request_body) {
    try {

        return new Promise(function(resolve, reject) {

            if (!request_body) {

                var options = {
                    host: sHost,
                    port: sPort,
                    path: sPath,
                    method: sTypeCall
                }

                var http = require('http');

                var req = http.request(options, function(res) {
                    res.setEncoding('utf8');

                    res.on('data', function(chunk) {

                        return resolve(chunk);;

                    });
                });
                req.end();
            } else {

                var options = {
                    host: sHost,
                    port: sPort,
                    path: sPath,
                    method: sTypeCall,
                    headers: {
                        "Content-Type": "application/json",
                        "Content-Lenght": Buffer.byteLength(request_body)
                    }
                }
                var http = require('http');
                var req = http.request(options, function(res) {
                    res.setEncoding('utf8');

                    res.on('data', function(chunk) {

                        return resolve(chunk);;



                    });
                });
                req.write(request_body);
                req.end();
            }


        });


    } catch (express) {
        console.log('CallAPI :' + express);
    }


}

async function ProcessMessage(sender_id, recipient_id, message) {

    try {

        var CountSpace = 0;
        for (let index = 0; index < message.length; index++) {

            if (message[index] == ' ') CountSpace++; // message =  message.slice(0,0);
            else break;

        }

        if (CountSpace != 0) message = message.slice(CountSpace, message.length);
      //  console.log('sender_id :'+sender_id);

        var level = await CallAPI("GET", service_host, service_port, '/api/v1/Permission/CheckPermission?PSID=' + sender_id);

        //console.log("level "+level);

        var empty = "คำถามไม่ถูกตรงตามรูปแบบ";
        var sNotpermisstion = "คุณไม่สามารถเข้าถึง Bot ได้ กรุณาติดต่อ ServiceDesk OFM"

        if (level.toUpperCase() != '') {
            var command = message.split(' ');


            if (command.length > 0 && command.length == 1) {

                if (command[0].toUpperCase() === 'HELP') {

                    var messageHelp = await CallAPI("GET", service_host, service_port, '/api/v1/Permission/getHelp?sLevel=' + level);

                    /*
                    var s = '##############help#################\n';
                    s += 'Pattern Chat with Bot\n';
                    s += '\n';
                    s += '1.Question Daily Sales Volumn to Bot.\n';
                    s += '\n';
                    s += '#Pattern I Chat text\n';
                    s += 'Format:"Sales(space)XXXXX"\n';
                    s += '"Sales"-Fixed wording\n';
                    s += '"XXXXX"-(StoreNumber or StoreCode or Thai Name or Eng Name or Short Name Code)\n';
                    s += '\n';
                    s += 'EX:\n';
                    s += 'Sales 58\n';
                    s += 'Sales JTC\n';
                    s += '\n';
                    s += '#Pattern II Carousel\n';
                    s += 'Keyword for Carousel is (Sales, Sale, ยอดขาย)\n';
                    s += '* when use this keyword Bot show Carousel\n';
                    s += '1st select carousel district Manager\n';
                    s += '2nd select carousel store under district Manager\n';
                    s += 'Bot will display Daily Sale Volumn\n';
                    s += '\n';
                    s += '2.Question Stock Realtime by Store to Bot.\n';
                    s += '\n';
                    s += '#Pattern I Chat text\n';
                    s += 'Format:"Stock(space)XXXXX(space)PID/SKU(space)YYYYYYY(space)YYYYYYY...\n';
                    s += '"Stock"-Fixed wording\n';
                    s += '"PID/SKU"-use one for question "PID" or "SKU"\n';
                    s += '"XXXXX"-(StoreNumber or StoreCode or Thai Name or Eng Name or Short Name Code)\n';
                    s += '"YYYYYYY"-PID Code or SKU Code (limited 5 items)\n';
                    s += '\n';
                    s += 'EX:\n';
                    s += 'Stock JTC PID 8000004 8151390 8000005 8030370 8031610\n';
                    s += 'Stock JTC SKU 149345 149347 149353 149361 14936\n';
                    s += 'Stock 58 PID 8000004 8151390 8000005 8030370 8031610\n';
                    s += '\n';
                    s += '\n';
                    s += '3.Question Check Location near Stock to Bot.\n';
                    s += '\n';
                    s += '#Pattern I Chat text\n';
                    s += 'Format:"LOC(space)ZZZZZZ(space)PID/SKU(space)YYYYYYY(space)YYYYYYY..."\n';
                    s += '"Stock"-Fixed wording\n';
                    s += '"PID/SKU"-use one for question "PID" or "SKU"\n';
                    s += '"ZZZZZZ"-(Location รหัสเขตที่ต้องการลูกค้าต้องการสินค้า)\n';
                    s += '"YYYYYYY"-PID Code or SKU Code (limited 5 items)\n';
                    s += 'Note: sequence setup by store operation\n';
                    s += 'เขต-สัมพันธวงศ์ ,ป้อมปราบศัตรูพ่าย,บางคอแหลม,คลองสาน,ยานนาวา,ราชเทวี,ดินแดง,พญาไท,สาทร,ห้วยขวาง,บางรัก,ปทุมวัน,คลองเตย,วัฒนา\n';
                    s += '\n'
                    s += 'EX:\n';
                    s += 'LOC ดินแดง PID 8000004 8151390 8000005 8030370 8031610\n';
                    s += 'LOC ดินแดง SKU 149345 149347 149353 149361 14936\n';
                    s += 'LOC ห้วยขวาง PID 8000004 8151390 8000005 8030370 8031610\n';
                    //  s +=  '--------------------------------\n'; 
    
                    console.log('Value : ' + s);

                    */

                    SendMessage(TypeMessage_Text, recipient_id, messageHelp);
                } else {
                    if (command[0].toUpperCase() === 'S' || command[0] === 'ยอดขาย' || command[0].toUpperCase() === 'SALES' || command[0].toUpperCase() === 'SALE') {
                        if (level.toUpperCase() === 'ADMIN' || level.toUpperCase() === 'ALL' || level.toUpperCase() === 'SALE') {
                            SendMessage(TypeMessage_Generic, recipient_id, await CallAPI("GET", service_host, service_port, '/api/v1/Sales/GetDistrict'));
                        } else SendMessage(TypeMessage_Text, recipient_id, sNotpermisstion);

                    } else {
                        SendMessage(TypeMessage_Text, recipient_id, empty);
                    }



                }

            } else if (command.length > 1) {



                if (command[0].toUpperCase() === 'S' || command[0] === 'ยอดขาย' || command[0].toUpperCase() === 'SALES' || command[0].toUpperCase() === 'SALE') {

                    if (level.toUpperCase() === 'ADMIN' || level.toUpperCase() === 'ALL' || level.toUpperCase() === 'SALE') {
                        var request_body = JSON.stringify({

                            "message": command[1]
                        });

                        SendMessage(TypeMessage_Text, recipient_id, await CallAPI("POST", service_host, service_port, '/api/v1/Sales/GetSales', request_body));
                    } else {
                        SendMessage(TypeMessage_Text, recipient_id, sNotpermisstion);
                    }


                } else if (command[0].toUpperCase() === 'LOC' || command[0].toUpperCase() === 'LOCATION') {

                    if (level.toUpperCase() === 'ADMIN' || level.toUpperCase() === 'ALL' || level.toUpperCase() === 'STOCK') {
                        var stext = '';

                        for (i = 1; i < command.length; i++) {
                            stext += command[i] + ' ';
                        }

                        stext = stext.substring(0, stext.length - 1);

                        var request_body = JSON.stringify({

                            "message": stext

                        });


                        SendMessage(TypeMessage_Text, recipient_id, await CallAPI("POST", service_host, service_port, '/api/v1/Stock/GetStock_ByArea', request_body));
                    } else SendMessage(TypeMessage_Text, recipient_id, sNotpermisstion);

                } else if (command[0].toUpperCase() === 'STOCK') {

                    if (level.toUpperCase() === 'ADMIN' || level.toUpperCase() === 'ALL' || level.toUpperCase() === 'STOCK') {
                        var stext = '';

                        for (i = 1; i < command.length; i++) {
                            stext += command[i] + ' ';
                        }

                        stext = stext.substring(0, stext.length - 1);
                        var request_body = JSON.stringify({

                            "message": stext

                        });
                        SendMessage(TypeMessage_Text, recipient_id, await CallAPI("POST", service_host, service_port, '/api/v1/Stock/GetSotck_ByLoc', request_body));
                    } else {
                        SendMessage(TypeMessage_Text, recipient_id, sNotpermisstion);
                    }
                } else if (command[0].toUpperCase() === 'DISTRICT') {

                    if (level.toUpperCase() === 'ADMIN' || level.toUpperCase() === 'ALL' || level.toUpperCase() === 'SALE')
                    {
                        SendMessage(TypeMessage_Generic, recipient_id, await CallAPI("GET", service_host, service_port, '/api/v1/Sales/GetStore?DistrictID=' + command[1]));
                    }
                    else
                    {
                        SendMessage(TypeMessage_Text, recipient_id, sNotpermisstion);
                    }


                   
                } else {
                    SendMessage(TypeMessage_Text, recipient_id, empty);
                }

            } else {
                SendMessage(TypeMessage_Text, recipient_id, empty);
            }

        } else {
            SendMessage(TypeMessage_Text, recipient_id, sNotpermisstion);
        }

    } catch (express) {
        console.log('ProcessMessage :' + express);
    }


}

function SendMessage(type, recipient_id, Message) {
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
                            data += ',"buttons": [{"type":"' + Value[index]['button']['type'] +
                                '","title":"' + Value[index]['button']['title'] +
                                '","payload":"' + recipient_id + "," + Value[index]['button']['payload'] + '"}]';
                        }

                        data += '}';

                        if (index != 10 && index != Value.length - 1) data += ",";
                    }
                    data = "[" + data + "]";


                    if (recipient_id.search('t_') > -1) {
                        request_body = JSON.stringify({
                            "messaging_type": "RESPONSE",
                            "recipient": {
                                "thread_key": recipient_id
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
                                "id": recipient_id
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
            if (recipient_id.search('t_') > -1) {

                request_body = JSON.stringify({
                    "messaging_type": "RESPONSE",
                    "recipient": {
                        "thread_key": recipient_id
                    },
                    "message": {
                        "text": Message
                    }
                });
            } else {

                request_body = JSON.stringify({
                    "messaging_type": "RESPONSE",
                    "recipient": {
                        "id": recipient_id
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
                    host: apifacebook_host,
                    path: apifacebook_path,
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
                        // console.log('Complete : ' + chunk);
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