var ws = {};
var user = {
    username: bag.session.username,
    name: bag.session.name,
    role: bag.session.role
};
// =================================================================================
// On Load
// =================================================================================
$(document).on('ready', function () {
    console.log('dashboard.js file loaded successfully!!');
    $('h3.dashheading').append(' - Test');
    connect_to_server();
});

function connect_to_server() {
    var connected = false;
    connect();

    function connect() {
        var wsUri = '';
        console.log('protocol', window.location.protocol);
        if (window.location.protocol === 'https:') {
            wsUri = "wss://" + bag.setup.SERVER.EXTURI;
        }
        else {
            wsUri = "ws://" + bag.setup.SERVER.EXTURI;
        }

        ws = new WebSocket(wsUri);
        ws.onopen = function (evt) {
            onOpen(evt);
        };
        ws.onclose = function (evt) {
            onClose(evt);
        };
        ws.onmessage = function (evt) {
            onMessage(evt);
        };
        ws.onerror = function (evt) {
            onError(evt);
        };
    }

    function onOpen(evt) {
        console.log("WS CONNECTED");
        connected = true;
        //clear_blocks();
        //$("#errorNotificationPanel").fadeOut();
        /*ws.send(JSON.stringify({type: "chainstats", v: 2, user: user.username}));
        ws.send(JSON.stringify({type: "get_papers", v: 2, user: user.username}));
        if (user.name && user.role !== "auditor") {
            ws.send(JSON.stringify({type: 'get_company', company: user.name, user: user.username}));
        }*/
    }

    function onClose(evt) {
        console.log("WS DISCONNECTED", evt);
        connected = false;
        setTimeout(function () {
            connect();
        }, 5000);					//try again one more time, server restarts are quick
    }

	function onMessage(msg) {
		try {
			var data = JSON.parse(msg.data);
			console.log('rec', data);
			if (data.msg === 'papers') {
				try{
					var papers = JSON.parse(data.papers);
					//console.log('!', papers);
					/*if ($('#auditPanel').is){
						for (var i in panels) {
							build_trades(papers, panels[i]);
						}
					}*/
				}
				catch(e){
					console.log('cannot parse papers', e);
				}
			}
			else if (data.msg === 'chainstats') {
				console.log(JSON.stringify(data));
				/*var e = formatDate(data.blockstats.transactions[0].timestamp.seconds * 1000, '%M/%d/%Y &nbsp;%I:%m%P');
				$("#blockdate").html('<span style="color:#fff">TIME</span>&nbsp;&nbsp;' + e + ' UTC');
				var temp = {
					id: data.blockstats.height,
					blockstats: data.blockstats
				};
				new_block(temp);*/									//send to blockchain.js
			}
			else if (data.msg === 'company') {
				try{
					var company = JSON.parse(data.company);
					//$("#accountBalance").html(formatMoney(company.cashBalance));
				}
				catch(e){
					console.log('cannot parse company', e);
				}
			}
			else if (data.msg === 'reset') {
				// Ask for all available trades and information for the current company
				ws.send(JSON.stringify({type: "get_papers", v: 2, user: user.username}));
                ws.send(JSON.stringify({type: "chainstats", v: 2, user: user.username}));
				if (user.role !== "auditor") {
					ws.send(JSON.stringify({type: 'get_company', company: user.name, user: user.username}));
				}
			}
			else if (data.type === 'error') {
				console.log("Error:", data.error);
			}
		}
		catch (e) {
			console.log('ERROR', e);
			//ws.close();
		}
	}

    function onError(evt) {
        console.log('ERROR ', evt);
        if (!connected && bag.e == null) {											//don't overwrite an error message
            $("#errorName").html("Warning");
            $("#errorNoticeText").html("Waiting on the node server to open up so we can talk to the blockchain. ");
            $("#errorNoticeText").append("This app is likely still starting up. ");
            $("#errorNoticeText").append("Check the server logs if this message does not go away in 1 minute. ");
            $("#errorNotificationPanel").fadeIn();
        }
    }

    function sendMessage(message) {
        console.log("SENT: " + message);
        ws.send(message);
    }
}
