const { Expo } = require('expo-server-sdk');

let expo = new Expo();

let messages = [];
for (let pushToken of ['ExponentPushToken[iVOLpLCpk00qdBIc_qDp1G]' , 'ExponentPushToken[Srs9vUDFBvK8C26miRkOGQ]', 'ExponentPushToken[3lQ7MBHxyd4Cs__ksSLYBR]']) {
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Push token ${pushToken} is not a valid Expo push token`);
    continue;
  }

  messages.push({
    to: pushToken,
    title: 'Testing immediate testing Title',
    body: 'Testing body',
    data: { test: 'value' },
    priority: "high",
    vibrate: true,
    sound: 'default',
    channelId: "Follow Duo",
    android: {
      sound: true,
      vibrate: true,
    },
    ios: {
      sound: true,
      vibrate: true,
    },
  });
}

let chunks = expo.chunkPushNotifications(messages);
let tickets = [];
(async () => {
  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log(ticketChunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error(error);
    }
  }
})();

let receiptIds = [];
for (let ticket of tickets) {
  // NOTE: Not all tickets have IDs; for example, tickets for notifications
  // that could not be enqueued will have error information and no receipt ID.
  if (ticket.id) {
    receiptIds.push(ticket.id);
  }
}

let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
(async () => {
  // Like sending notifications, there are different strategies you could use
  // to retrieve batches of receipts from the Expo service.
  for (let chunk of receiptIdChunks) {
    try {
      let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
      console.log(receipts);

      // The receipts specify whether Apple or Google successfully received the
      // notification and information about an error, if one occurred.
      for (let receipt of receipts) {
        if (receipt.status === 'ok') {
          continue;
        } else if (receipt.status === 'error') {
          console.error(`There was an error sending a notification: ${receipt.message}`);
          if (receipt.details && receipt.details.error) {
            // The error codes are listed in the Expo documentation:
            // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
            // You must handle the errors appropriately.
            console.error(`The error code is ${receipt.details.error}`);
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
})();
