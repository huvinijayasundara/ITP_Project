// ✅ FIXED: Added correct backend URL
// This file handles sending messages to the chatbot backend

export const sendMessageToBot = async (message) => {
  try {
    // ✅ IMPORTANT: Use full URL with localhost:5000 (your backend port)
    const res = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    
    // Check if response is OK
    if (!res.ok) {
      throw new Error('Failed to get response from server');
    }
    
    const data = await res.json();
    return data.reply || "Sorry, I can't respond right now.";
  } catch (err) {
    console.error('Chatbot API Error:', err);
    return "Sorry, I'm having trouble connecting. Please try again.";
  }
};