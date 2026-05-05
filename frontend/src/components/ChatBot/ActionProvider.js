import { sendMessageToBot } from "../../api/chatApi";

class ActionProvider {
  constructor(createChatBotMessage, setState, createClientMessage) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setState;
    this.createClientMessage = createClientMessage;
  }

  async handleMessage(message) {
    const botReply = await sendMessageToBot(message);
    const botMessage = this.createChatBotMessage(botReply);
    this.setState(prev => ({ ...prev, messages: [...prev.messages, botMessage] }));
  }
}

export default ActionProvider;