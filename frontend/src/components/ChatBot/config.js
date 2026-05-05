import { createChatBotMessage } from "react-chatbot-kit";

const config = {
  botName: "HandcraftBot",
  initialMessages: [
    createChatBotMessage("Hi! I can help you with promotions, discounts, feedback, ratings, and complaints.")
  ],
  customStyles: {
    botMessageBox: { backgroundColor: "#B8764F" },
    chatButton: { backgroundColor: "#B8764F" }
  }
};

export default config;