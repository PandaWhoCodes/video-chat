// When the DOM is ready


function getUrlVars() {
  var vars = [],
    hash;
  var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
  for (var i = 0; i < hashes.length; i++) {
    hash = hashes[i].split('=');

    if ($.inArray(hash[0], vars) > -1) {
      vars[hash[0]] += "," + hash[1];
    } else {
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
    }
  }

  return vars;
}

document.addEventListener("DOMContentLoaded", function(event) {


  var peer_id;
  var username;
  var conn;
  peers = [];
  // {peer_id:'','username:''}
  var url_vars = getUrlVars();

  /**
   * Important: the host needs to be changed according to your requirements.
   * e.g if you want to access the Peer server from another device, the
   * host would be the IP of your host namely 192.xxx.xxx.xx instead
   * of localhost.
   *
   */
  var peer = new Peer({
    host: "recover-peers.herokuapp.com",
    port: 443,
    // path: '/peerjs',
    secure: true,
    debug: 3,
    config: {
      'iceServers': [{
          url: 'stun:stun1.l.google.com:19302'
        },
        {
          url: 'turn:numb.viagenie.ca',
          credential: 'muazkh',
          username: 'webrtc@live.com'
        }
      ]
    }
  });

  if ("session_id" in url_vars) {
    conn = peer.connect(url_vars["session_id"], {
      metadata: {
        'username': "second_user"
      }
    });

    conn.on('data', handleMessage);

    // video calling
    var call = peer.call(peer_id, window.localStream);

        call.on('stream', function (stream) {
            window.peer_stream = stream;

            onReceiveStream(stream, '2');

  }

  // Once the initialization succeeds:
  // Show the ID that allows other user to connect to your session.
  peer.on('open', function() {

    // document.getElementById("peer-id-label").innerHTML = peer.id;
    console.log("Peer-id: " + peer.id);
    $("#peer-id").text(peer.id);
  });

  // When someone connects to your session:
  //
  // 1. Hide the peer_id field of the connection form and set automatically its value
  // as the peer of the user that requested the connection.
  // 2.

  peer.on('connection', function(connection) {
    conn = connection;
    peer_id = connection.peer;

    // Use the handleMessage to callback when a message comes in
    conn.on('data', handleMessage);

    // Hide peer_id field and set the incoming peer id as value
    // document.getElementById("peer_id").className += " hidden";
    // document.getElementById("peer_id").value = peer_id;
    // document.getElementById("connected_peer").innerHTML = connection.metadata.username;
  });

  peer.on('error', function(err) {
    alert("An error ocurred with peer: " + err);
    console.error(err);
  });

  /**
   * Handle the on receive call event
   */
  peer.on('call', function(call) {


    call.answer(window.localStream);

    // Receive data
    call.on('stream', function(stream) {
      // Store a global reference of the other user stream
      window.peer_stream = stream;
      // Display the stream of the other user in the peer-camera video element !
      onReceiveStream(stream, '1');
    });

    // Handle when the call finishes
    call.on('close', function() {
      alert("The videocall has finished");
    });

    // use call.close() to finish a call

  });

  /**
   * Starts the request of the camera and microphone
   *
   * @param {Object} callbacks
   */
  function requestLocalVideo(callbacks) {
    // Monkeypatch for crossbrowser geusermedia
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    // Request audio an video
    navigator.getUserMedia({
      audio: true,
      video: true
    }, callbacks.success, callbacks.error);
  }

  /**
   * Handle the providen stream (video and audio) to the desired video element
   *
   * @param {*} stream
   * @param {*} element_id
   */
  function onReceiveStream(stream, element_id) {



    // Retrieve the video element according to the desired
    const video = document.getElementById(element_id);
    try {
      video.srcObject = stream;
    } catch (error) {
      video.src = window.URL.createObjectURL(stream);
    }

    window.peer_stream = stream;
  }

  /**
   * Appends the received and sent message to the listview
   *
   * @param {Object} data
   */
  function handleMessage(data) {
    var orientation = "text-left";

    // If the message is yours, set text to right !
    if (data.from == username) {
      orientation = "text-right"
    }

    var messageHTML = '<a href="javascript:void(0);" class="list-group-item' + orientation + '">';
    messageHTML += '<h4 class="list-group-item-heading">' + data.from + '</h4>';
    messageHTML += '<p class="list-group-item-text">' + data.text + '</p>';
    messageHTML += '</a>';

    document.getElementById("messages").innerHTML += messageHTML;
  }

  /**
   * Handle the send message button
   */
  // document.getElementById("send-message").addEventListener("click", function(){
  //     // Get the text to send
  //     var text = document.getElementById("message").value;
  //
  //     // Prepare the data to send
  //     var data = {
  //         from: username,
  //         text: text
  //     };
  //
  //     // Send the message with Peer
  //     conn.send(data);
  //
  //     // Handle the message on the UI
  //     handleMessage(data);
  //
  //     document.getElementById("message").value = "";
  // }, false);

  /**
   *  Request a videocall the other user
   */
  // document.getElementById("call").addEventListener("click", function(){
  //     console.log('Calling to ' + peer_id);
  //     console.log(peer);
  //
  //     var call = peer.call(peer_id, window.localStream);
  //
  //     call.on('stream', function (stream) {
  //         window.peer_stream = stream;
  //
  //         onReceiveStream(stream, 'peer-camera');
  //     });
  // }, false);

  /**
   * On click the connect button, initialize connection with peer
   */
  // document.getElementById("connect-to-peer-btn").addEventListener("click", function(){
  //     username = document.getElementById("name").value;
  //     peer_id = document.getElementById("peer_id").value;
  //
  //     if (peer_id) {
  //         conn = peer.connect(peer_id, {
  //             metadata: {
  //                 'username': username
  //             }
  //         });
  //
  //         conn.on('data', handleMessage);
  //     }else{
  //         alert("You need to provide a peer to connect with !");
  //         return false;
  //     }
  //
  //     document.getElementById("chat").className = "";
  //     document.getElementById("connection-form").className += " hidden";
  // }, false);

  /**
   * Initialize application by requesting your own video to test !
   */
  requestLocalVideo({
    success: function(stream) {
      window.localStream = stream;
      onReceiveStream(stream, '1');
    },
    error: function(err) {
      alert("Cannot get access to your camera and video !");
      console.error(err);
    }
  });
}, false);


function show_invite_link() {
  var peer_id = $("#peer-id").text();
  var location = window.location;
  var final_link = location + "?session_id=" + peer_id;
  var output_html = "Share this link to invite others: <a href='>" + final_link + "'>" + final_link + "</a>"
  $("#invite_link").html(output_html);
  $(".modal").addClass("is-active");
}
