import React, { useState } from "react";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const openChat = () => {
    setIsOpen(true);
    setMessages([{ text: "Hi! How can I help you?", sender: "bot" }]); // Reset with welcome msg
  };

  const closeChat = () => {
    setIsOpen(false);
    setMessages([]); // Clear all messages
    setInput("");
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.text }),
      });

      const data = await res.json();
      const botReply = data.response || "⚠️ No response from server.";

      setMessages((prev) => [...prev, { text: botReply, sender: "bot" }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { text: `⚠️ Error: ${err.message}`, sender: "bot" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={openChat}
          className="fixed bottom-5 right-5 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center"
        >
          <span className="text-3xl">💬</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 w-80 h-96 bg-white shadow-2xl rounded-2xl flex flex-col border">
          {/* Header */}
          <div className="flex justify-between items-center p-3 bg-blue-600 text-white rounded-t-2xl">
            <h2 className="text-sm font-semibold">Chat Support</h2>
            <button
              onClick={closeChat}
              className="font-bold text-lg hover:text-red-400"
            >
              ❌
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-3 overflow-y-auto text-sm space-y-2">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg max-w-[75%] ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white self-end ml-auto"
                    : "bg-gray-200 text-black self-start mr-auto"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="p-2 rounded-lg max-w-[75%] bg-gray-200 text-black self-start mr-auto">
                Typing...
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="p-2 border-t flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 px-2 py-1 border rounded-lg text-sm focus:outline-none"
            />
            <button
              onClick={handleSend}
              className="ml-2 bg-blue-600 text-white px-3 py-1 rounded-lg"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
