// document.addEventListener("DOMContentLoaded", () => {

//   const toggleBtn = document.getElementById("fastsewaChatbotToggle");
//   const chatbot = document.getElementById("fastsewaChatbotContainer");
//   const closeBtn = document.getElementById("chatbotCloseBtn");
//   const sendBtn = document.getElementById("chatbotSendBtn");
//   const input = document.getElementById("chatbotInput");
//   const messages = document.getElementById("chatbotMessages");

//   const API = "http://127.0.0.1:5000/api";

//   // OPEN chatbot
//   toggleBtn.addEventListener("click", () => {
//     chatbot.style.display = "flex";
//   });

//   // CLOSE chatbot
//   closeBtn.addEventListener("click", () => {
//     chatbot.style.display = "none";
//   });

//   sendBtn.addEventListener("click", sendMessage);

//   input.addEventListener("keypress", (e) => {
//     if (e.key === "Enter") sendMessage();
//   });

//   function addMessage(text, type) {
//     const div = document.createElement("div");
//     div.classList.add("chatbot-message");

//     if (type === "bot") {
//       div.classList.add("chatbot-bot-message");
//     } else {
//       div.classList.add("chatbot-user-message");
//     }

//     div.innerHTML = text.replace(/\n/g, "<br>");
//     messages.appendChild(div);
//     messages.scrollTop = messages.scrollHeight;
//   }

//   async function sendMessage() {
//     const msg = input.value.trim();
//     if (!msg) return;

//     addMessage(msg, "user");
//     input.value = "";

//     try {
//       const res = await fetch(`${API}/chat`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ message: msg })
//       });

//       const data = await res.json();
//       addMessage(data.response, "bot");

//       if (data.pdf_generated) {
//         addMessage(
//           `<a class="pdf-download-btn" target="_blank"
//            href="${API}/download-pdf/${data.pdf_file}">
//            📄 Download PDF</a>`,
//           "bot"
//         );
//       }

//     } catch (err) {
//       addMessage("⚠️ Server se connect nahi ho pa raha", "bot");
//     }
//   }

//   // Initial welcome message
//   addMessage(
//     "👋 Welcome to FastSewa Assistant!<br>" +
//     "You can ask about:<br>" +
//     "💰 Finance<br>⚖️ Legal & GST<br>📋 Land<br>🏗 Construction",
//     "bot"
//   );
// });

// document.addEventListener("DOMContentLoaded", () => {

//   const toggleBtn = document.getElementById("fastsewaChatbotToggle");
//   const chatbot = document.getElementById("fastsewaChatbotContainer");
//   const closeBtn = document.getElementById("chatbotCloseBtn");
//   const sendBtn = document.getElementById("chatbotSendBtn");
//   const input = document.getElementById("chatbotInput");
//   const messages = document.getElementById("chatbotMessages");

//   // ✅ LIVE BACKEND API (Railway)
//   const API = "https://fastsewabackend-production.up.railway.app/api";

//   // OPEN chatbot
//   toggleBtn.addEventListener("click", () => {
//     chatbot.style.display = "flex";
//   });

//   // CLOSE chatbot
//   closeBtn.addEventListener("click", () => {
//     chatbot.style.display = "none";
//   });

//   sendBtn.addEventListener("click", sendMessage);

//   input.addEventListener("keypress", (e) => {
//     if (e.key === "Enter") sendMessage();
//   });

//   function addMessage(text, type) {
//     const div = document.createElement("div");
//     div.classList.add("chatbot-message");

//     if (type === "bot") {
//       div.classList.add("chatbot-bot-message");
//     } else {
//       div.classList.add("chatbot-user-message");
//     }

//     div.innerHTML = text.replace(/\n/g, "<br>");
//     messages.appendChild(div);
//     messages.scrollTop = messages.scrollHeight;
//   }

//   async function sendMessage() {
//     const msg = input.value.trim();
//     if (!msg) return;

//     addMessage(msg, "user");
//     input.value = "";

//     try {
//       const res = await fetch(`${API}/chat`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({ message: msg })
//       });

//       if (!res.ok) {
//         throw new Error("Server error");
//       }

//       const data = await res.json();
//       addMessage(data.response || "No response from server", "bot");

//       // PDF download support
//       if (data.pdf_generated && data.pdf_file) {
//         addMessage(
//           `<a class="pdf-download-btn" target="_blank"
//            href="${API}/download-pdf/${data.pdf_file}">
//            📄 Download PDF</a>`,
//           "bot"
//         );
//       }

//     } catch (err) {
//       addMessage(" Backend se connect nahi ho pa raha", "bot");
//       console.error(err);
//     }
//   }

//   // Initial welcome message
//   addMessage(
//     "👋 Welcome to FastSewa Assistant!<br>" +
//     "You can ask about:<br>" +
//     "💰 Finance<br>⚖️ Legal & GST<br>📋 Land<br>🏗 Construction",
//     "bot"
//   );
// });

document.addEventListener("DOMContentLoaded", () => {

  const toggleBtn = document.getElementById("fastsewaChatbotToggle");
  const chatbot = document.getElementById("fastsewaChatbotContainer");
  const closeBtn = document.getElementById("chatbotCloseBtn");
  const sendBtn = document.getElementById("chatbotSendBtn");
  const input = document.getElementById("chatbotInput");
  const messages = document.getElementById("chatbotMessages");

  // ✅ SAME-ORIGIN BACKEND (recommended for deployment)
  const API = "/api";

  toggleBtn.onclick = () => chatbot.style.display = "flex";
  closeBtn.onclick = () => chatbot.style.display = "none";
  sendBtn.onclick = sendMessage;


  input.addEventListener("keypress", e => {
    if (e.key === "Enter") sendMessage();
  });

  function addMessage(text, type) {
    const div = document.createElement("div");
    div.className = "chatbot-message " + (type === "bot"
      ? "chatbot-bot-message"
      : "chatbot-user-message");

    div.innerHTML = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  async function sendMessage(msgFromBtn) {
    const msg = msgFromBtn || input.value.trim();
    if (!msg) return;

    addMessage(msg, "user");
    input.value = "";

    try {
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg })
      });

      const data = await res.json();
      addMessage(data.response || "No response", "bot");

      if (data.pdf_generated && data.pdf_file) {
        addMessage(
          `<a class="pdf-download-btn" target="_blank"
           href="${API}/download-pdf/${data.pdf_file}">
           📄 Download PDF</a>`,
          "bot"
        );
      }
    } catch {
      addMessage("❌ Backend connection error", "bot");
    }
  }

  // Welcome + Services
  addMessage("👋 Welcome to FastSewa! Please select a service 👇", "bot");

  addMessage(`
    <div class="service-buttons">
      <button class="service-btn" onclick="sendMessage('finance')">💰 Finance</button>
      <button class="service-btn" onclick="sendMessage('legal')">⚖ Legal & GST</button>
      <button class="service-btn" onclick="sendMessage('land')">📋 Land</button>
      <button class="service-btn" onclick="sendMessage('construction')">🏗 Construction</button>
      <button class="service-btn" onclick="sendMessage('security')">🛡 Security</button>
      <button class="service-btn" onclick="sendMessage('repair')">🔧 Repair</button>
    </div>
  `, "bot");

});
