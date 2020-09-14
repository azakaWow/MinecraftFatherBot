const TelegramBot = require("node-telegram-bot-api");
const cp = require("child_process");
const { TOKEN, OWNER_CHAT_ID, STOP_SERVER_PASS, START_SERVER_SHELL_SCRIPT } = require('./config');

const bot = new TelegramBot(TOKEN, { polling: true });
let server = null;

bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  let username = 'anonymous';
  if(msg.chat && msg.chat.username) username = msg.chat.username;
  if(msg.chat && (msg.chat.first_name && msg.chat.last_name)) username = `${msg.chat.first_name} ${msg.chat.last_name}`;

  function sendMessage(userMsg, ownerMsg) {
    bot.sendMessage(chatId, userMsg);
    bot.sendMessage(OWNER_CHAT_ID, ownerMsg);
  }
 
  if (msg.text === "start" && server === null) {
    startServer();
    sendMessage("Starting... check it, in 20sec",`${username} -  started server`);
  } else if (msg.text === "start" && server !== null) {
    sendMessage("Server is already working",`${username} -  Tried to start a running server`);
  } else if (msg.text === `stop ${STOP_SERVER_PASS}`) {
    stopServer();
    sendMessage("Stopping server",`${username} -  stopped server`);
  } else if (msg.text === `status`) {
    sendMessage(`Server is ${server === null ? 'down' : 'up'}`,`${username} - is curious about server status`);
  } else {
    sendMessage("Oh shit I am sorry", `${username} -  is sorry`);
  }
});


const startServer = () => {
  try {
    server = cp.spawn(START_SERVER_SHELL_SCRIPT);
    server.stdout.pipe(process.stdout);
    server.on("exit", (code) => {
    console.log(`Server process exited with code ${code}`);
    });
  } catch(e) {
    bot.sendMessage(OWNER_CHAT_ID, 'Error occurred while starting the server');
    bot.sendMessage(OWNER_CHAT_ID, e);
  }
};

const stopServer = () => {
  try {
    server.stdin.write("/stop\n");
    server.stdin.end();
    server = null;
  } catch(e) {
    bot.sendMessage(OWNER_CHAT_ID, 'Error occurred while stopping the server');
    bot.sendMessage(OWNER_CHAT_ID, e);
  }
};
