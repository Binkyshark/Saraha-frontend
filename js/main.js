

// window.onload = getMessages;
const BASE_URL = "https://saraha-back.vercel.app/";

// ... دوال signup, login, sendMessage, deleteMessage كما هي ...

// دالة إرسال رد
async function sendReply(messageId, replyText, replyContainer) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("You must be logged in to send a reply.");
    return;
  }
  if (!replyText.trim()) {
    alert("Reply cannot be empty.");
    return;
  }

  try {
    // نفترض وجود API استقبال الردود على الرسالة
    const res = await fetch(`${BASE_URL}/message/reply/${messageId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ text: replyText.trim() })
    });

    const result = await res.json();
    alert(result.message);

    if (res.ok) {
      replyContainer.innerHTML = ""; // إخفاء صندوق الرد
      getMessages(); // تحديث الرسائل
    }
  } catch (err) {
    console.error("Reply send error:", err);
    alert("Failed to send reply. Check console.");
  }
}

// تعديل getMessages لعرض صندوق الرد والتحكم بزر الرد
async function getMessages() {
  const token = localStorage.getItem("token");
  const container = document.getElementById("messages");

  

  try {
    const res = await fetch(`${BASE_URL}/message`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const result = await res.json();

    container.innerHTML = "";

    if (result.data && result.data.length > 0) {
      result.data.forEach(msg => {
        const div = document.createElement("div");
        div.classList.add("message-card");

        div.innerHTML = `
          <div><strong>From:</strong> ${msg.sender?.username || "Unknown"}</div>
          <div><strong>Message:</strong> ${msg.text}</div>
          <div><small>${new Date(msg.createdAt).toLocaleString()}</small></div>
          <button class="delete-btn" data-id="${msg._id}">Delete</button>
          <button class="reply-btn" data-id="${msg._id}">Reply</button>
          <div class="reply-container" data-id="${msg._id}" style="margin-top:10px;"></div>
        `;

        container.appendChild(div);
      });

      // حدث زر حذف
      container.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", e => {
          const id = e.target.getAttribute("data-id");
          deleteMessage(id);
        });
      });

      // حدث زر رد: إظهار وإخفاء صندوق الرد مع زر إرسال
      container.querySelectorAll(".reply-btn").forEach(btn => {
        btn.addEventListener("click", e => {
          const id = e.target.getAttribute("data-id");
          const replyContainer = container.querySelector(`.reply-container[data-id="${id}"]`);

          if (replyContainer.innerHTML.trim() === "") {
            replyContainer.innerHTML = `
              <textarea rows="3" style="width: 100%; padding:8px;" placeholder="Write your reply..."></textarea>
              <button class="send-reply-btn" style="margin-top:8px;">Send Reply</button>
            `;

            replyContainer.querySelector(".send-reply-btn").addEventListener("click", () => {
              const replyText = replyContainer.querySelector("textarea").value;
              sendReply(id, replyText, replyContainer);
            });

          } else {
            replyContainer.innerHTML = "";
          }
        });
      });

    } else {
      container.innerHTML = "<p>No messages yet.</p>";
    }
  } catch (err) {
    console.error("Error loading messages:", err);
    container.innerHTML = "<p>Failed to load messages. Check console.</p>";
  }
}




