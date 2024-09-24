require("dotenv").config();
console.log('Heating up the WhatsApp Invoice Server...');
const wa = require("@open-wa/wa-automate");
const {
  dbConnect
} = require("./configs/db.config");
const Sales = require("./models/sales");
const {
  ChatOpenAI
} = require("@langchain/openai");
const {
  StringOutputParser
} = require("@langchain/core/output_parsers");
const openAIApiKey = process.env.OPENAI_API_KEY;
const {
  getUserStage,
  setUserStage
} = require("./helpers/caching.helper");
const {
  PromptTemplate
} = require("@langchain/core/prompts");
dbConnect();
wa.create({
  port: 3002,
  sessionId: "invoice_session",
  chromiumArgs: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-accelerated-2d-canvas",
    "--no-first-run",
    "--no-zygote",
    "--single-process",
    "--disable-gpu",
  ],
  useChrome: true,
  multiDevice: true,
  authTimeout: 0,
  blockCrashLogs: true,
  disableSpins: true,
  headless: true,
  hostNotificationLang: "PT_BR",
  logConsole: false,
  popup: true,
  qrTimeout: 0,
}).then((client) => {
  start(client);
});

async function start(client) {
  console.log("WhatsApp Sales Server is up and running!");
  client.onMessage(async (message) => {

    if(message.body === 'ask'){
      await client.sendText(message.from,'You can ask me questions about your Sales, just send me a message like this: *What is my Sales for the last month?*');
      await setUserStage(message.from, 'answering-question');
    }


    const userStage = await getUserStage(message.from);
    if (userStage) {
      if (userStage === 'saving-new-sale') {
        await initiateSaveNewSale(message);
      } else if (userStage === 'answering-question') {
        const answer = await answerQuestion(message);
        await client.sendText(message.from, answer);
      }
    } else {
      await client.sendText(message.from, "Hi, I'm Omi😊, your personal Sales Assistant.\n\nI'm here to help you manage your sales.\n\nTo record a new sale, just send me a message like this: *iPhone 15 Promax $1500*, i'll handle the rest.");
      await setUserStage(message.from, 'saving-new-sale');
    }

  });

  async function initiateSaveNewSale(message) {
    try {
      const newSale = JSON.parse(await checkIfNewSale(message.body));
      if (newSale.productName && newSale.amount) {
        const newSaleRecord = new Sales({
          productName: newSale.productName,
          amount: newSale.amount,
          user: message.from,
        })
        await newSaleRecord.save();
        return await client.sendText(message.from, `New entry saved successfully😁!\n\nYour new entry is:\n\n*Item*: ${newSale.productName}\n*Amount*:$${newSale.amount}`);
      } else {
        return await client.sendText(message.from, "Sorry, I couldn't extract the information from the message. Please try again.");
      }
    } catch (error) {
      return error
    }

  }

  async function checkIfNewSale(message) {
    try {
      const llm = new ChatOpenAI({
        openAIApiKey: openAIApiKey
      })
      const SaveNewSalePromptTemplate = `
    You are a helpful Accounting Assistant that helps to save new sales.
    You will be given a message from the user and you will need to extract the following information:
    - Product Name (e.g. iPhone 12, Rice, Apple)
    - Amount (e.g. 100, 50, 20)
    Your task is to extract the information from the message as a JSON object like this:
    {{
        "productName": "product name",
        "amount": "amount"
    }}\n
    If the message does not contain the required information, return null.
    Sometimes the product name might not be obvious, so just take what you think might be the name of the product in the message.
    The message is: ${message}
    `;
      const SaveNewSalePrompt = PromptTemplate.fromTemplate(SaveNewSalePromptTemplate);
      const chain = SaveNewSalePrompt.pipe(llm)
      const response = await chain.invoke({
        message: message
      });
      return response.content;

    } catch (e) {
      console.error(e);
    }
  }

  async function getUserSales(user) {
    try {
      const userSales = await Sales.find({
        user: user
      });
      return JSON.stringify(userSales);
    } catch (e) {
      console.error(e);
    }
  }

  async function answerQuestion(message) {
    try {
      //  answers questions about the user's Sales 
      const llm = new ChatOpenAI({
        openAIApiKey: openAIApiKey
      })
      const AnswerQuestionPromptTemplate = `
      You are a helpful Accounting Assistant on Whatsapp that helps to answer questions about the user's Sales.
      Given a question or statement from user, you are supposed to answer it basing your analysis on the user's Sales.
      The user's Sales will include the following information: productName , which is the name of the product, and amount, which is the amount of the sale in dollars.
      Give your answer in json format like this:
      {{
          "answer": "answer"
      }}
      The date today is ${new Date().toLocaleDateString()}
      The question is: {userQuestion}
      The user's Sales are: {userSales},
      your answer is:
      `
      const AnswerQuestionPrompt = PromptTemplate.fromTemplate(AnswerQuestionPromptTemplate);
      const chain = AnswerQuestionPrompt.pipe(llm)
      const response = await chain.invoke({
        userQuestion: message.body,
        userSales: await getUserSales(message.from)
      });
      let responseContent = JSON.parse(response.content);
      return responseContent.answer;
    } catch (error) {

    }
  }




}