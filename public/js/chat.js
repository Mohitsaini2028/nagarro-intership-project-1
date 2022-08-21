const socket = io();



async function loadMsgs(){
    let allMsgs = await axios.get('/allmessages');
    console.log(allMsgs);
    
    for(let msg of allMsgs.data){
        var timestamp = timeDifference(new Date(), new Date(msg.createdAt));
        if(msg.user==currentUser){
            $('#all-msg-container').append(
                `<li class="my-4 p-2 rounded currentuser">
                    <span>${msg.user}<span>
                    <span class="time">${timestamp} <span>
                    <p>${msg.content}</p>
                </li>`
            )
        }
        else{
            $('#all-msg-container').append(
                `<li class="my-4 p-2 rounded otheruser">
                    <span>${msg.user}<span>
                    <span class="time">${timestamp} <span>
                    <p>${msg.content}</p>
        
                </li>`
            )
        }

    }


}

loadMsgs();




$('#send-msg-btn').click(()=>{
    const textMsg = $('#msg-text').val();

    socket.emit("send-msg",{
        user:currentUser,
        msg:textMsg,
    })

    $('#msg-text').val("");
})


socket.on("recived-msg" , (data)=>{

    var curstamp = timeDifference(new Date(), new Date(msg.createdAt));

    $('#all-msg-container').append(
        `<li class="my-4 p-2 rounded otheruser">
        <span>${msg.user}<span>
        <span class="time">${curstamp} <span>
        <p>${msg.content}</p>
    </li>`
    )
})


function timeDifference(current, previous) {
    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;
  
    var elapsed = current - previous;
  
    if (elapsed < msPerMinute) {
      if (elapsed / 1000 < 30) {
        return "Just now";
      }
  
      return Math.round(elapsed / 1000) + " seconds ago";
    } else if (elapsed < msPerHour) {
      return Math.round(elapsed / msPerMinute) + " minutes ago";
    } else if (elapsed < msPerDay) {
      return Math.round(elapsed / msPerHour) + " hours ago";
    } else if (elapsed < msPerMonth) {
      return Math.round(elapsed / msPerDay) + " days ago";
    } else if (elapsed < msPerYear) {
      return Math.round(elapsed / msPerMonth) + " months ago";
    } else {
      return Math.round(elapsed / msPerYear) + " years ago";
    }
  }
  