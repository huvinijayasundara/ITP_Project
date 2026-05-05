// ✅ FIXED: Proper data validation and greeting responses

const Discount = require("../models/discount");
const Promotion = require("../models/promotion");
const Feedback = require("../models/feedback");
const Complaint = require("../models/complaint");

const handleChat = async (req, res) => {
  try {
    const { message } = req.body;

    // Validate message input
    if (!message || message.trim() === "") {
      return res.json({ reply: "Please type a message so I can help you! 😊" });
    }

    // Normalize message: lowercase, remove extra spaces
    const normalizedMessage = message.toLowerCase().trim();
    
    console.log("💬 Chatbot received:", normalizedMessage); // Debug log

    let reply = ""; // Will be set based on query

    // ✅ FIXED: Handle greetings FIRST (before other conditions)
    if (
      normalizedMessage.match(/^(hi|hello|hey|hii|hiii|greetings|good morning|good afternoon|good evening)$/i) ||
      normalizedMessage.match(/^(hi|hello|hey|hii|hiii)\s*[.!,]*$/i)
    ) {
      reply = "👋 Hello! Welcome to Handcraft Paradise! How can I assist you today?\n\n" +
             "I can help you with:\n" +
             "💰 Discounts & Offers\n" +
             "🎊 Promotions & Campaigns\n" +
             "💬 Customer Feedback\n" +
             "📋 Complaints & Issues\n\n" +
             "Just ask me something like:\n" +
             "• 'Any discounts today?'\n" +
             "• 'Show promotions'\n" +
             "• 'Customer feedback'";
    }

    // ✅ FIXED: Better discount handling with data validation
    else if (
      normalizedMessage.includes("discount") ||
      normalizedMessage.includes("sale") ||
      normalizedMessage.includes("offer") ||
      normalizedMessage.includes("deal") ||
      normalizedMessage.includes("coupon") ||
      normalizedMessage.includes("promo code")
    ) {
      const discounts = await Discount.find().sort({ createdAt: -1 }).limit(5);
      
      if (discounts.length > 0) {
        reply = "🎉 Great news! Here are our current discounts:\n\n";
        discounts.forEach((d, index) => {
          // ✅ FIXED: Validate data before displaying
          const title = d.title || "Special Discount";
          const percentage = d.percentage || d.discountPercentage || 0;
          const description = d.description || "";
          const code = d.code || d.discountCode || "";
          
          reply += `${index + 1}. ${title} - ${percentage}% OFF\n`;
          if (description) {
            reply += `   📝 ${description}\n`;
          }
          if (code) {
            reply += `   🎫 Code: ${code}\n`;
          }
          reply += "\n";
        });
        reply += "💰 Don't miss out on these amazing deals!";
      } else {
        reply = "Currently, we don't have any active discounts, but check back soon! We frequently update our offers. 🛍️";
      }
    }

    // ✅ FIXED: Better promotion handling with data validation
    else if (
      normalizedMessage.includes("promotion") ||
      normalizedMessage.includes("special") ||
      normalizedMessage.includes("campaign") ||
      normalizedMessage.includes("event")
    ) {
      const promotions = await Promotion.find().sort({ createdAt: -1 }).limit(5);
      
      if (promotions.length > 0) {
        reply = "🎊 Check out our exciting promotions:\n\n";
        promotions.forEach((p, index) => {
          // ✅ FIXED: Validate data before displaying
          const title = p.title || p.name || "Special Promotion";
          const description = p.description || p.details || "Limited time offer!";
          const startDate = p.startDate ? new Date(p.startDate).toLocaleDateString() : "";
          const endDate = p.endDate ? new Date(p.endDate).toLocaleDateString() : "";
          
          reply += `${index + 1}. ${title}\n`;
          reply += `   📝 ${description}\n`;
          if (startDate || endDate) {
            reply += `   📅 Valid: ${startDate || 'Now'} - ${endDate || 'Limited Time'}\n`;
          }
          reply += "\n";
        });
        reply += "✨ Take advantage of these limited-time offers!";
      } else {
        reply = "No active promotions at the moment, but stay tuned! We'll have exciting offers coming soon. 🌟";
      }
    }

    // ✅ FIXED: Better feedback handling
    else if (
      normalizedMessage.includes("feedback") ||
      normalizedMessage.includes("review") ||
      normalizedMessage.includes("comment") ||
      normalizedMessage.includes("opinion")
    ) {
      const feedbacks = await Feedback.find().sort({ createdAt: -1 }).limit(5);
      
      if (feedbacks.length > 0) {
        reply = "💬 Here's what our customers are saying:\n\n";
        feedbacks.forEach((f, index) => {
          // ✅ FIXED: Validate data
          const message = f.message || f.comment || f.feedback || "Great service!";
          const customerName = f.customerName || f.name || "Anonymous Customer";
          const rating = f.rating || "";
          
          reply += `${index + 1}. "${message}"\n`;
          reply += `   👤 - ${customerName}`;
          if (rating) {
            reply += ` | ⭐ ${rating}/5`;
          }
          reply += "\n\n";
        });
        reply += "Thank you to all our valued customers! 🙏";
      } else {
        reply = "No customer feedback available yet. Be the first to share your thoughts! 📝";
      }
    }

    // ✅ FIXED: Better complaint handling
    else if (
      normalizedMessage.includes("complaint") ||
      normalizedMessage.includes("issue") ||
      normalizedMessage.includes("problem") ||
      normalizedMessage.includes("concern")
    ) {
      const complaints = await Complaint.find().sort({ createdAt: -1 }).limit(5);
      
      if (complaints.length > 0) {
        reply = "📋 Recent customer concerns:\n\n";
        complaints.forEach((c, index) => {
          // ✅ FIXED: Validate data
          const message = c.message || c.description || c.issue || "Issue reported";
          const status = c.status || "Pending Review";
          const date = c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "";
          
          reply += `${index + 1}. ${message}\n`;
          reply += `   📊 Status: ${status}`;
          if (date) {
            reply += ` | 📅 ${date}`;
          }
          reply += "\n\n";
        });
        reply += "💼 We're working hard to resolve all issues!";
      } else {
        reply = "Great news! No complaints recorded at the moment. 🎉";
      }
    }

    // ✅ NEW: Handle help requests
    else if (
      normalizedMessage.includes("help") ||
      normalizedMessage.includes("what can you do") ||
      normalizedMessage.includes("assist") ||
      normalizedMessage.includes("support")
    ) {
      reply = "🤖 I'm your Handcraft Assistant! Here's how I can help:\n\n" +
             "💰 **Discounts** - Ask: 'Any discounts?' or 'Show me deals'\n" +
             "🎊 **Promotions** - Ask: 'What promotions?' or 'Any offers?'\n" +
             "💬 **Feedback** - Ask: 'Show feedback' or 'Customer reviews'\n" +
             "📋 **Complaints** - Ask: 'Any complaints?' or 'Recent issues'\n\n" +
             "✨ Just type naturally and I'll understand! Try asking:\n" +
             "• 'What discounts are available today?'\n" +
             "• 'Any promotions?'\n" +
             "• 'Show me customer feedback'";
    }

    // ✅ NEW: Handle "today" specific queries
    else if (normalizedMessage.includes("today")) {
      // Check what they're asking about today
      if (normalizedMessage.includes("discount") || normalizedMessage.includes("offer") || normalizedMessage.includes("deal")) {
        const discounts = await Discount.find().sort({ createdAt: -1 }).limit(3);
        if (discounts.length > 0) {
          reply = "🎯 Today's special discounts:\n\n";
          discounts.forEach((d, i) => {
            const title = d.title || "Special Discount";
            const percentage = d.percentage || d.discountPercentage || 0;
            reply += `${i + 1}. ${title} - ${percentage}% OFF\n`;
          });
          reply += "\n💰 Grab these deals before they expire!";
        } else {
          reply = "No special discounts today, but check our regular promotions! 🛍️";
        }
      } else if (normalizedMessage.includes("promotion")) {
        const promotions = await Promotion.find().sort({ createdAt: -1 }).limit(3);
        if (promotions.length > 0) {
          reply = "🎊 Today's promotions:\n\n";
          promotions.forEach((p, i) => {
            const title = p.title || p.name || "Special Promotion";
            const description = p.description || p.details || "";
            reply += `${i + 1}. ${title}\n`;
            if (description) reply += `   ${description}\n`;
          });
          reply += "\n✨ Don't miss out!";
        } else {
          reply = "No special promotions today, but we update regularly! 🌟";
        }
      } else {
        reply = "What would you like to know about today? I can tell you about:\n" +
               "• Discounts & Deals 💰\n" +
               "• Promotions & Offers 🎊\n" +
               "• Customer Feedback 💬\n" +
               "Just ask away! 😊";
      }
    }

    // ✅ NEW: Handle thank you messages
    else if (
      normalizedMessage.includes("thank") ||
      normalizedMessage.includes("thanks") ||
      normalizedMessage.includes("appreciate")
    ) {
      reply = "You're very welcome! 😊 Is there anything else I can help you with?\n\n" +
             "Feel free to ask about discounts, promotions, feedback, or any other questions!";
    }

    // ✅ NEW: Handle goodbye messages
    else if (
      normalizedMessage.includes("bye") ||
      normalizedMessage.includes("goodbye") ||
      normalizedMessage.includes("see you") ||
      normalizedMessage.includes("later")
    ) {
      reply = "Goodbye! 👋 Thank you for visiting Handcraft Paradise!\n\n" +
             "Come back anytime if you need help. Happy shopping! 🛍️✨";
    }

    // ✅ IMPROVED: Better fallback response with suggestions
    else {
      reply = "I'm not sure I understood that. 🤔\n\n" +
             "💡 Try asking me about:\n" +
             "• 'What discounts are available?'\n" +
             "• 'Any promotions today?'\n" +
             "• 'Show me customer feedback'\n" +
             "• 'Recent complaints'\n\n" +
             "Or type 'help' to see all options! 😊";
    }

    // Log the response for debugging
    console.log("🤖 Bot reply:", reply.substring(0, 100) + "...");

    // Send response
    res.json({ reply });

  } catch (err) {
    console.error("❌ Chatbot error:", err);
    res.status(500).json({ 
      reply: "Oops! I encountered an error. Please try again in a moment. 😅\n\n" +
             "If this persists, please contact our support team." 
    });
  }
};

module.exports = { handleChat };