async function refreshPosts() {
  $(".postsContainer").empty();
  const posts = await axios.get("/api/post");

  for (let post of posts.data) {
    const html = createPostHtml(post);
    $(".postsContainer").prepend(html);
  }
}

refreshPosts();

// Creating a new post
$("#submitPostButton").click(async () => {
  const postText = $("#post-text").val();
  await axios.post("/api/post", { content: postText });
  $("#post-text").val("");
  refreshPosts();
});

$(".postsContainer").on("click", ".likeButton", async (event) => {
  const button = $(event.target);
  const postId = getPostIdFromElement(button);

  const postData = await axios.patch(`/api/posts/${postId}/like`);

  button.find("span").text(postData.data.likes.length);
});

$("#submitReplyButton").click(async (event) => {
  const element = $(event.target);
  const postText = $("#reply-text-container").val();

  const replyTo = element.attr("data-id");

  const postData = await axios.post("/api/post", {
    content: postText,
    replyTo: replyTo,
  });

  location.reload();
});

$("#replyModal").on("show.bs.modal", async (event) => {
  const button = $(event.relatedTarget);
  const postId = getPostIdFromElement(button);

  $("#submitReplyButton").attr("data-id", postId);

  const postData = await axios.get(`/api/posts/${postId}`);

  const html = createPostHtml(postData.data);

  $("#originalPostContainer").empty();

  $("#originalPostContainer").append(html);
});

function getPostIdFromElement(element) {
  const isRoot = element.hasClass("post");

  const rootElement = isRoot === true ? element : element.closest(".post");
  const postId = rootElement.data().id;

  return postId;
}

function createPostHtml(postData) {

  // if tweet contain hastag then changing it's style. 
  if(postData.content !== undefined){
        
    arr = postData.content.split(" ");

    for (index = 0; index < arr.length; index++) {
        if(arr[index].startsWith('#')){
            arr[index]= `<span class='link'>${arr[index]}</span>`;
        }          
    }
    
    postData.content = arr.join(' ');
    
   }


  const postedBy = postData.postedBy;

  if (postedBy._id === undefined) {
    return console.log("User object not populated");
  }

  var displayName = postedBy.firstName + " " + postedBy.lastName;
  const timestamp = timeDifference(new Date(), new Date(postData.createdAt));

  let replyFlag = "";
  if (postData.replyTo && postData.replyTo._id) {
    if (!postData.replyTo._id) {
      return alert("Reply to is not populated");
    } else if (!postData.replyTo.postedBy._id) {
      return alert("Posted by is not populated");
    }

    const replyToUsername = postData.replyTo.postedBy.username;
    replyFlag = `<div class='replyFlag'>
                          Replying to <a href='/profile/${replyToUsername}'>@${replyToUsername}<a>
                      </div>`;
  }

  // if user is verified account changing it's style.
  if(postedBy.isVerified){
    displayName += `<svg viewBox="0 0 24 24" aria-label="Verified account" id="verified" class="r-1cvl2hr r-4qtqp9 r-yyyyoo r-1xvli5t r-f9ja8p r-og9te1 r-bnwqim r-1plcrui r-lrvibr"><g><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"></path></g></svg>`;
  }

  return `<div class='post' data-id='${postData._id}'>

                <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img src='${postedBy.profilePic}'>
                    </div>
                    <div class='postContentContainer'>
                        <div class='header'>
                            <a href='/profile/${postedBy.username}' class='displayName'>${displayName}</a>
                            <span class='username'>@${postedBy.username}</span>
                            <span class='date'>${timestamp}</span>
                            <div>${replyFlag}</div>
                        </div>
                        <div class='postBody'>
                            <span>${postData.content}</span>
                        </div>
                        <div class='postFooter'>
                            <div class='postButtonContainer'>
                                <button type="button" data-bs-toggle="modal" data-bs-target="#replyModal">
                                    <i class='far fa-comment'></i>
                                </button>
                            </div>
                            <div class='postButtonContainer green'>
                                <button class='retweet'>
                                    <i class='fas fa-retweet'></i>
                                </button>
                            </div>
                            <div class='postButtonContainer red'>
                                <button class='likeButton'>
                                    <i class='far fa-heart'></i>
                                    <span>${postData.likes.length || ""}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
}

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
