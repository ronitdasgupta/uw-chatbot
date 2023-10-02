import React, { useState } from 'react';
import './Chatbot.css';

const Message = ({ role, content }) => {
  return <div className={`message ${role}`}>{content}</div>;
};

const Chatbot = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [records, setRecords] = useState({});
 
  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const getChatHistory = () => {
    if (Object.keys(records).length === 0) {
      return "";
    }

    const formattedHistory = Object.keys(records).map((key) => {
      const record = records[key];
      return `Input: ${record.userInput}\nResponse: ${record.response}\n`;
    });

    const historyString = formattedHistory.join("\n");

    return `Below is the chat history:\n\n${historyString}\nPlease answer the user’s new input based on the chat history provided: `;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input) return; // Prevent sending empty messages
 
    setInput('');
 
    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
 
    setLoading(true);

    const chatHistory = getChatHistory();

    let combinedChat = chatHistory + input;

    console.log(input)
    console.log(combinedChat)
 
    const response = await fetch('/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ combinedChat }),
      // body: JSON.stringify({ chatHistory, input }),
    });
 
    const data = await response.json();
 
    const assistantMessage = { role: 'assistant', content: data.answer };
    setMessages([...updatedMessages, assistantMessage]);
 
    setLoading(false);
 
    setRecords(prevRecords => {
      const newCounter = Object.keys(prevRecords).length + 1;
      const newRecord = { userInput: input, response: data.answer };
      const updatedRecords = { ...prevRecords, [newCounter]: newRecord };
      console.log(updatedRecords)
      return updatedRecords;
    });
   

    // console.log(chatHistory)
    if (chatHistory !== "") {
      // console.log(chatHistory);
      // Send chatHistory to OpenAI API
    }
  };

  return (
    <div className="chatbot">
        <h1 className="chatbot-title">University of Washington ChatBot</h1>
      <div className="chat">
        <div className="chat-messages">
          {messages.map((message, index) => (
            <Message key={index} role={message.role} content={message.content} />
          ))}
          {loading && <div className="message assistant">Typing...</div>}
        </div>
        <div className="chat-input">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Type a message..."
            />
            <button type="submit">Send</button>
          </form>
        </div>
      </div>
    </div>
  );

};

export default Chatbot;
