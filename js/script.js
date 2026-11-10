document.addEventListener("DOMContentLoaded", () => {

    // ELEMENTS

    const aiOrb = document.getElementById("aiOrb");
    const coreStatus = document.getElementById("coreStatus");

    const input = document.getElementById("userInput");
    const messages = document.getElementById("messages");

    const sendBtn = document.getElementById("sendBtn");
    const voiceBtn = document.getElementById("voiceBtn");

    const speechToggle = document.getElementById("speechToggle");
    const newChatBtn = document.getElementById("newChatBtn");

    const chatHistoryList = document.getElementById("chatHistoryList");
    const allConversationsList = document.getElementById("allConversationsList");

    // STORAGE

    const CHAT_STORAGE_KEY = "aris_conversations";
    const TASK_STORAGE_KEY = "aris_tasks";

    let conversations = loadConversations();
    let currentConversationId = null;
    let speechEnabled = true;

    // INITIALIZATION

    function loadConversations() {
        try {
            const saved = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY));
            return Array.isArray(saved) ? saved : [];
        } catch (error) {
            console.error("Chat storage error:", error);
            return [];
        }
    }

    function saveConversations() {
        localStorage.setItem(
            CHAT_STORAGE_KEY,
            JSON.stringify(conversations)
        );
    }

    function createId() {
        return Date.now().toString() + Math.random().toString(36).slice(2, 8);
    }

    function createConversation() {

        const conversation = {
            id: createId(),
            title: "New Conversation",
            messages: [],
            createdAt: new Date().toISOString()
        };

        conversations.unshift(conversation);

        currentConversationId = conversation.id;

        saveConversations();
        renderHistory();
        renderMessages();

        return conversation;
    }

    function getCurrentConversation() {
        return conversations.find(
            conversation => conversation.id === currentConversationId
        );
    }

    // NAVIGATION

    const navItems = document.querySelectorAll(".nav-item");
    const pages = document.querySelectorAll(".page");

    const pageTitles = {
        dashboard: "Dashboard",
        assistant: "AI Assistant",
        conversations: "Conversations",
        smarthome: "Smart Home",
        devices: "My Devices",
        tasks: "Tasks",
        memory: "ARIS Memory",
        health: "ARIS Health",
        settings: "Settings"
    };

    function openPage(pageName) {

        const targetPage = document.getElementById(pageName);

        if (!targetPage) return;

        pages.forEach(page => page.classList.remove("active"));

        navItems.forEach(item => {
            item.classList.remove("active");
        });

        targetPage.classList.add("active");

        const activeNav = document.querySelector(
            `.nav-item[data-page="${pageName}"]`
        );

        if (activeNav) {
            activeNav.classList.add("active");
        }

        document.getElementById("pageTitle").textContent =
            pageTitles[pageName] || "ARIS";

        document.getElementById("breadcrumb").textContent =
            "Home / " + (pageTitles[pageName] || "ARIS");

        if (pageName === "conversations") {
            renderAllConversations();
        }

        if (pageName === "assistant") {
            renderHistory();
            renderMessages();
        }

        const sidebar = document.getElementById("sidebar");

        if (window.innerWidth <= 850) {
            sidebar.classList.remove("open");
        }
    }

    navItems.forEach(item => {
        item.addEventListener("click", () => {
            openPage(item.dataset.page);
        });
    });

    document.querySelectorAll("[data-open]").forEach(button => {
        button.addEventListener("click", () => {
            openPage(button.dataset.open);
        });
    });

    document.getElementById("menuToggle").addEventListener("click", () => {
        document.getElementById("sidebar").classList.toggle("open");
    });

    // CLOCK

    function updateClock() {

        const now = new Date();

        document.getElementById("clock").textContent =
            now.toLocaleTimeString();

        document.getElementById("date").textContent =
            now.toLocaleDateString(undefined, {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            });
    }

    updateClock();
    setInterval(updateClock, 1000);

    // AI CORE STATES

    function setCoreState(state) {

        if (!aiOrb || !coreStatus) return;

        aiOrb.classList.remove(
            "listening",
            "thinking",
            "speaking"
        );

        if (state !== "idle") {
            aiOrb.classList.add(state);
        }

        const statusMessages = {
            idle: "System Standby",
            listening: "Listening...",
            thinking: "ARIS is Thinking...",
            speaking: "ARIS is Speaking..."
        };

        coreStatus.innerHTML =
            `<span class="online-dot"></span> ${statusMessages[state] || statusMessages.idle}`;
    }

    // TEXT TO SPEECH

    function speak(text) {

        if (!speechEnabled) return;

        if (!("speechSynthesis" in window)) return;

        window.speechSynthesis.cancel();

        const speech = new SpeechSynthesisUtterance(text);

        speech.lang = "hi-IN";
        speech.rate = 1;
        speech.pitch = 1;

        speech.onstart = () => {
            setCoreState("speaking");
        };

        speech.onend = () => {
            setCoreState("idle");
        };

        speech.onerror = () => {
            setCoreState("idle");
        };

        window.speechSynthesis.speak(speech);
    }

    speechToggle.addEventListener("click", () => {

        speechEnabled = !speechEnabled;

        speechToggle.textContent = speechEnabled
            ? "🔊 Voice ON"
            : "🔇 Voice OFF";

        if (!speechEnabled && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            setCoreState("idle");
        }
    });

    // CHAT MESSAGE DISPLAY

    function addMessage(text, type) {

        const messageElement = document.createElement("div");

        messageElement.className = type;
        messageElement.textContent = text;

        messages.appendChild(messageElement);

        messages.scrollTop = messages.scrollHeight;
    }

    function renderMessages() {

        messages.innerHTML = "";

        const conversation = getCurrentConversation();

        if (!conversation || conversation.messages.length === 0) {

            addMessage(
                "Hello Arman! 👋 Main ARIS hoon. Aap mujhse kya karwana chahenge?",
                "bot-message"
            );

            return;
        }

        conversation.messages.forEach(message => {
            addMessage(message.text, message.sender === "user"
                ? "user-message"
                : "bot-message"
            );
        });
    }

    // SAVE MESSAGE

    function saveMessage(text, sender) {

        const conversation = getCurrentConversation();

        if (!conversation) return;

        conversation.messages.push({
            text: text,
            sender: sender,
            time: new Date().toISOString()
        });

        if (conversation.title === "New Conversation" && sender === "user") {
            conversation.title = text.slice(0, 35);

            if (text.length > 35) {
                conversation.title += "...";
            }
        }

        saveConversations();
        renderHistory();
        renderAllConversations();
    }

    // SEND MESSAGE

    function sendMessage() {

        const text = input.value.trim();

        if (!text) return;

        if (!currentConversationId) {
            createConversation();
        }

        addMessage(text, "user-message");
        saveMessage(text, "user");

        input.value = "";

        setCoreState("thinking");

        setTimeout(() => {

            const response = getARISResponse(text);

            addMessage(response, "bot-message");
            saveMessage(response, "bot");

            speak(response);

            if (!speechEnabled) {
                setCoreState("idle");
            }

        }, 1000);
    }

    // DEMO RESPONSE SYSTEM

    function getARISResponse(text) {

        const message = text.toLowerCase();

        if (
            message.includes("hello") ||
            message.includes("hi") ||
            message.includes("hey") ||
            message.includes("namaste")
        ) {
            return "Hello Arman! Main ARIS hoon. Aapki kya help kar sakta hoon?";
        }

        if (
            message.includes("your name") ||
            message.includes("tumhara naam")
        ) {
            return "Mera naam ARIS hai. Advanced Intelligence System.";
        }

        if (
            message.includes("time") ||
            message.includes("samay")
        ) {
            return "Abhi ka time hai " + new Date().toLocaleTimeString();
        }

        if (
            message.includes("date") ||
            message.includes("tarikh")
        ) {
            return "Aaj ki date hai " + new Date().toLocaleDateString();
        }

        if (
            message.includes("who are you") ||
            message.includes("kaun ho")
        ) {
            return "Main ARIS hoon, aapka personal assistant interface. Mera AI brain abhi connect nahi hua hai.";
        }

        if (
            message.includes("thank")
        ) {
            return "You're welcome, Arman! Main aapki help ke liye ready hoon.";
        }

        if (
            message.includes("help") ||
            message.includes("madad")
        ) {
            return "Bilkul! Aap mujhse time, date aur basic commands ke baare mein pooch sakte hain. Real AI connection abhi configure nahi hua hai.";
        }

        return "Samajh gaya. Main ARIS hoon, lekin mera real AI brain abhi connect nahi hua hai. AI API connect hone ke baad main advanced questions ka jawab de paunga.";
    }

    sendBtn.addEventListener("click", sendMessage);

    input.addEventListener("keydown", event => {

        if (event.key === "Enter") {
            sendMessage();
        }
    });

    // VOICE RECOGNITION

    function startVoice() {

        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Voice recognition is not supported in this browser. Please try Chrome or Edge.");
            return;
        }

        const recognition = new SpeechRecognition();

        recognition.lang = "hi-IN";
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setCoreState("listening");
            voiceBtn.textContent = "🔴";
        };

        recognition.onresult = event => {

            const transcript = event.results[0][0].transcript;

            input.value = transcript;

            setCoreState("thinking");

            sendMessage();
        };

        recognition.onerror = () => {
            setCoreState("idle");
            voiceBtn.textContent = "🎙";
        };

        recognition.onend = () => {

            voiceBtn.textContent = "🎙";

            if (
                !window.speechSynthesis ||
                !window.speechSynthesis.speaking
            ) {
                setCoreState("idle");
            }
        };

        recognition.start();
    }

    voiceBtn.addEventListener("click", startVoice);

    // NEW CHAT

    newChatBtn.addEventListener("click", () => {

        createConversation();

        input.focus();
    });

    // OPEN CONVERSATION

    function openConversation(id) {

        currentConversationId = id;

        renderMessages();
        renderHistory();

        openPage("assistant");
    }

    // DELETE CONVERSATION

    function deleteConversation(id) {

        const confirmed = confirm(
            "Are you sure you want to delete this conversation?"
        );

        if (!confirmed) return;

        conversations = conversations.filter(
            conversation => conversation.id !== id
        );

        if (currentConversationId === id) {
            currentConversationId = null;

            if (conversations.length > 0) {
                currentConversationId = conversations[0].id;
            } else {
                createConversation();
            }
        }

        saveConversations();
        renderHistory();
        renderMessages();
        renderAllConversations();
    }

    // CHAT HISTORY

    function renderHistory() {

        chatHistoryList.innerHTML = "";

        if (conversations.length === 0) {

            chatHistoryList.innerHTML =
                "<p>No conversations yet.</p>";

            return;
        }

        conversations.forEach(conversation => {

            const row = document.createElement("div");

            row.style.display = "flex";
            row.style.alignItems = "center";
            row.style.gap = "5px";

            const openButton = document.createElement("button");

            openButton.className = "small-btn";
            openButton.textContent = conversation.title;
            openButton.style.flex = "1";
            openButton.style.minWidth = "0";
            openButton.style.overflow = "hidden";
            openButton.style.textOverflow = "ellipsis";
            openButton.style.whiteSpace = "nowrap";

            if (conversation.id === currentConversationId) {
                openButton.style.borderColor = "#36d9ff";
            }

            openButton.addEventListener("click", () => {
                openConversation(conversation.id);
            });

            const deleteButton = document.createElement("button");

            deleteButton.className = "small-btn";
            deleteButton.textContent = "×";
            deleteButton.style.width = "35px";

            deleteButton.addEventListener("click", () => {
                deleteConversation(conversation.id);
            });

            row.appendChild(openButton);
            row.appendChild(deleteButton);

            chatHistoryList.appendChild(row);
        });
    }

    // ALL CONVERSATIONS PAGE

    function renderAllConversations() {

        allConversationsList.innerHTML = "";

        if (conversations.length === 0) {

            allConversationsList.innerHTML = `
                <div class="empty-state">
                    <div>▤</div>
                    <h3>No conversations yet</h3>
                    <p>Your conversations will appear here.</p>
                    <button class="primary-btn" id="startConversationBtn">
                        Start Conversation
                    </button>
                </div>
            `;

            document.getElementById("startConversationBtn")
                .addEventListener("click", () => {
                    createConversation();
                    openPage("assistant");
                });

            return;
        }

        conversations.forEach(conversation => {

            const item = document.createElement("div");

            item.className = "task-item";
            item.style.display = "flex";
            item.style.alignItems = "center";
            item.style.justifyContent = "space-between";
            item.style.gap = "10px";

            const title = document.createElement("span");

            title.textContent = conversation.title;

            const buttons = document.createElement("div");

            buttons.style.display = "flex";
            buttons.style.gap = "8px";

            const openButton = document.createElement("button");

            openButton.className = "small-btn";
            openButton.textContent = "Open";

            openButton.addEventListener("click", () => {
                openConversation(conversation.id);
            });

            const deleteButton = document.createElement("button");

            deleteButton.className = "small-btn";
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", () => {
                deleteConversation(conversation.id);
            });

            buttons.appendChild(openButton);
            buttons.appendChild(deleteButton);

            item.appendChild(title);
            item.appendChild(buttons);

            allConversationsList.appendChild(item);
        });
    }

    // SMART HOME DEMO

    document.querySelectorAll(".device-toggle").forEach(button => {

        button.addEventListener("click", () => {

            const target = document.getElementById(button.dataset.target);

            target.textContent =
                target.textContent === "OFF" ? "ON" : "OFF";
        });
    });

    // TASK MANAGEMENT

    const taskInput = document.getElementById("taskInput");
    const taskList = document.getElementById("taskList");
    const addTaskButton = document.getElementById("addTask");

    function loadTasks() {

        try {
            const saved = JSON.parse(
                localStorage.getItem(TASK_STORAGE_KEY)
            );

            if (Array.isArray(saved)) {
                return saved;
            }

        } catch (error) {
            console.error("Task storage error:", error);
        }

        return [
            { id: createId(), text: "Complete ARIS frontend" },
            { id: createId(), text: "Design AI dashboard" },
            { id: createId(), text: "Plan backend development" }
        ];
    }

    let tasks = loadTasks();

    function saveTasks() {

        localStorage.setItem(
            TASK_STORAGE_KEY,
            JSON.stringify(tasks)
        );
    }

    function renderTasks() {

        taskList.innerHTML = "";

        tasks.forEach(task => {

            const item = document.createElement("div");

            item.className = "task-item";

            const text = document.createElement("span");
            text.textContent = task.text;

            const deleteButton = document.createElement("button");

            deleteButton.className = "delete-task";
            deleteButton.textContent = "×";

            deleteButton.addEventListener("click", () => {

                tasks = tasks.filter(
                    savedTask => savedTask.id !== task.id
                );

                saveTasks();
                renderTasks();
            });

            item.appendChild(text);
            item.appendChild(deleteButton);

            taskList.appendChild(item);
        });

        document.getElementById("pendingTaskCount").textContent =
            tasks.length.toString().padStart(2, "0");
    }

    function addTask() {

        const text = taskInput.value.trim();

        if (!text) return;

        tasks.push({
            id: createId(),
            text: text
        });

        taskInput.value = "";

        saveTasks();
        renderTasks();
    }

    addTaskButton.addEventListener("click", addTask);

    taskInput.addEventListener("keydown", event => {

        if (event.key === "Enter") {
            addTask();
        }
    });

    // START ARIS

    if (conversations.length === 0) {
        createConversation();
    } else {
        currentConversationId = conversations[0].id;
    }

    renderHistory();
    renderMessages();
    renderAllConversations();
    renderTasks();

    setCoreState("idle");

    console.log("ARIS System Initialized Successfully.");

});
