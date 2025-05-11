addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
  });
  
  // Bot configuration - replace with your actual token
  const BOT_TOKEN = '7574791167:AAEDLmU541e_B1dkEFQKci75P5w35mbSAuc';
  const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
    
  async function handleRequest(request) {
    if (request.method === 'POST') {
      try {
        const update = await request.json();
  
        // Process the Telegram update
        if (update.message) {
          await processMessage(update.message);
        } else if (update.callback_query) {
          // Handle the callback query when the button is clicked
          await processCallbackQuery(update.callback_query);
        }
  
        return new Response('OK', { status: 200 });
      } catch (error) {
        return new Response(`Error: ${error.message}`, { status: 500 });
      }
    } else {
      return new Response('Send POST requests to this endpoint.', { status: 200 });
    }
  }
  
  async function processMessage(message) {
    const chatId = message.chat.id;
    const userId = message.from.id;
    const messageId = message.message_id;
  
    // Handle the /start command
    if (message.text && message.text.startsWith('/start')) {
      await sendChannelJoinMessage(chatId, messageId);
      return;  // Don't send "Please send me a valid link." message for /start
    }
  
    // Handle the Terabox link submission
    if (message.text && message.text.startsWith('http')) {
      await handleTeraboxLink(message, messageId);
    } else if (message.text) {
      // If the message is not a valid URL, prompt the user to send a valid link
      await sendMessage(chatId, 'Please send me a valid link.', messageId);
    }
  }
  
  // Handle the callback query when the "bhooya" button is clicked
  async function processCallbackQuery(callbackQuery) {
    const chatId = callbackQuery.message.chat.id;
    const messageId = callbackQuery.message.message_id;
  
    if (callbackQuery.data === 'join') {
      // Send success message when the user clicks "bhooya"
      await sendMessage(chatId, '🔓🔓Success! You Are Verifyed🔓🔓\n\nSend Me Terabox Link ', messageId);
    }
  }
  
  // Send channel join message with button
  async function sendChannelJoinMessage(chatId, messageId) {
    const inlineKeyboard = [
      [{
        text: 'Join Channel✅',
        url: `https://t.me/thbots1`
      },
      {
        text: 'Devloper✅',
        url: `https://t.me/Thoryxff`
      }],
      [{
        text: '🔓Joined🔓',
        callback_data: 'join'  // Adding callback data for Bhooya button
      }]
    ];
  
    // Send the message with the inline button
    await sendMessage(chatId, '⚡️Welcome to the Terabox Video Downloader Bot⚡️!\n\n⚡️You can also click the buttons below to join our channel and use the bot.⚡️', messageId, { inline_keyboard: inlineKeyboard });
  }
  
  // Handle Terabox URL submission
  async function handleTeraboxLink(message, messageId) {
    const chatId = message.chat.id;
    const teraboxUrl = message.text;
  
    console.log(`Received Terabox URL: ${teraboxUrl}`);  // Debugging line to log the Terabox URL
  
    // Ensure the Terabox URL contains the word "terabox" in the domain part of the URL
    const teraboxUrlPattern = /https:\/\/.*tera.*\.com\/s\/[A-Za-z0-9]+/;
    if (!teraboxUrl.match(teraboxUrlPattern)) {
      await sendMessage(chatId, 'Invalid Terabox link. Please provide a valid Terabox link with the word "terabox" in it.', messageId);
      return;
    }
  
    // Send a processing message before showing the final result
    const processingMessage = await sendMessage(chatId, '🔎 Processing URL...', messageId);
  
    // Wait for 3 seconds (3000 milliseconds)
    await new Promise(resolve => setTimeout(resolve, 3000));
  
    // Delete the processing message
    await deleteMessage(chatId, processingMessage.message_id);
  
    // Prepare the main API URL using the given Terabox URL
    const apiUrl = `https://tera-api-thory.vercel.app/api?api_key=7daysfreeapi&url=${encodeURIComponent(teraboxUrl)}`;
    //your terabox api
  
    // Create the inline keyboard with the generated API URL as a button
    const inlineKeyboard = [
      [{
        text: 'Play In Server 1',  // Button text
        web_app: { url: apiUrl }  // Button URL that redirects to the generated API
      }],
      [{
        text: 'Play In Server 2',  // Button text
        web_app: { url: apiUrl }  // Button URL that redirects to the generated API
      }]
    ];
  
    // Send the message with the inline button
    await sendMessage(chatId, '📺ʏᴏᴜʀ ᴠɪᴅᴇᴏ ɪꜱ ʀᴇᴀᴅʏ🎥\n\nPlease Chose Button To Play ', messageId, { inline_keyboard: inlineKeyboard });
  }
  
  // Function to send message with inline keyboard (if any)
  async function sendMessage(chatId, text, replyMessageId, inlineKeyboard = null) {
    const body = {
      chat_id: chatId,
      text: text,
      reply_to_message_id: replyMessageId,
      parse_mode: 'HTML',
      reply_markup: inlineKeyboard ? JSON.stringify(inlineKeyboard) : undefined
    };
  
    const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });
  
    return await response.json();
  }
  
  // Function to delete message
  async function deleteMessage(chatId, messageId) {
    const body = {
      chat_id: chatId,
      message_id: messageId
    };
  
    await fetch(`${TELEGRAM_API}/deleteMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });
  }
  
  // Function to check if user has joined the channel
  async function getUserChannelStatus(userId) {
    const response = await fetch(`${TELEGRAM_API}/getChatMember?chat_id=@${CHANNEL_USERNAME}&user_id=${userId}`);
    const data = await response.json();
  
    console.log('Channel Member Status:', data);  // Debugging line to log the response
  
    if (data.ok && (data.result.status === 'member' || data.result.status === 'administrator')) {
      return 'joined';
    } else {
      return 'not_joined';
    }
  }
  