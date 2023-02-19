async function clearMessages(maxCount, count = 0, interval = 3000) {
  const authorId = ""; // user id number
  const authToken = "";  // user auth token
  const apiVersion = "v9"; // api version
  const location = window.location.href.split('/')
  const channel = location.pop();
  const server = location.pop();

  const headers = { 'Authorization': authToken, 'Content-Type': 'application/json' };
  const baseURL = `https://discord.com/api/${apiVersion}`;
  const channelURL = `${baseURL}/channels/${channel}`;
  const searchURL = `${baseURL}/guilds/${server}/messages/search?author_id=${authorId}&channel_id=${channel}&include_nsfw=true`;
  let clock = 0;

  function delay(duration) {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(), duration);
    });
  }

  const response = await fetch(searchURL, { headers });
  if (!response.ok) {
    console.log("Error: " + response.status + " " + response.statusText);
    return
  }

  const json = await response.json();
  console.log("Found " + json.total_results + " messages to delete, deleting up to " + maxCount + " messages.");

  json.messages.map((message) => {
    message.forEach(async function (item) {

      if (item.hit === false) return;

      await delay(clock += interval);
      let deleteURL = `${channelURL}/messages/${item.id}`;
      let deleteResponse = await fetch(deleteURL, { method: 'DELETE', headers });
      count++;
      if (!deleteResponse.ok) {
        console.log("Error: " + deleteResponse.status + " " + deleteResponse.statusText);
        count = maxCount;
      } else {
        console.log("Deleted messageId " + item.id + " in channel " + channel + " count " + count + " of " + maxCount + ".")
      }
    });
  });

  if (json.total_results > 0) {
    await delay(clock += interval);
    if (count >= maxCount) {
      console.log("Stopped deleting messages after " + maxCount + " messages.")
    } else {
      clearMessages(maxCount, count, interval);
    };
  } else {
    console.log("Finished deleting messages")
  };
}
