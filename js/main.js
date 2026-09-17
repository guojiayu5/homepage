    // ============================================================
    //  V3 反馈后台配置（Supabase）
    //  把下面两个值替换成你自己的，获取位置：Supabase 控制台 -> Settings -> API
    //
    //  ✅ 这两个值可以公开，放在前端是安全的
    //  ❌ 绝对不要在这里填 secret key / service_role key
    // ============================================================
    const SUPABASE_URL = "https://nerfmmwuiwodbwwnsclj.supabase.co";
    const SUPABASE_KEY = "sb_publishable_T0tzXM51ScWL1caV-0wdNw_2eoByYGk";
    const FEEDBACK_TABLE = "feedback";
    const SITE_VERSION = "v3";

    function isSupabaseConfigured() {
      const url = SUPABASE_URL.trim();
      const key = SUPABASE_KEY.trim();
      return /^https:\/\/[^\s]+\.supabase\.(co|in)\/?$/.test(url) && key.length >= 20;
    }

    const db = (isSupabaseConfigured() && window.supabase && typeof window.supabase.createClient === "function")
      ? window.supabase.createClient(SUPABASE_URL.trim(), SUPABASE_KEY.trim())
      : null;

    if (!db) {
      console.warn("[反馈后台] 尚未配置，或 supabase-js 未加载，反馈提交功能当前不可用。请检查 js/main.js 顶部的 SUPABASE_URL / SUPABASE_KEY。");
    }

    // 自动识别访客设备（电脑 / 手机 / 平板），访客不必多填一项
    function detectDevice() {
      const ua = navigator.userAgent || "";
      if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) return "平板";
      if (/Mobi|iPhone|iPod|Android|BlackBerry|Windows Phone/i.test(ua)) return "手机";
      return "电脑";
    }

    // ============ 中英双语系统 ============
    const I18N = {
      lang: localStorage.getItem("ds_lang") || "zh",
      theme: localStorage.getItem("ds_theme") || "day"
    };
    const LANG = {
      zh: { name: "中文", btn: "English" },
      en: { name: "English", btn: "中文" }
    };
    const T = {
      zh: {
        "nav.home": "主页", "nav.info": "个人信息", "nav.chat": "数字分身",
        "nav.contact": "联系我", "nav.projects": "项目展示", "nav.suggest": "建议留言",
        "nav.education": "教育背景", "nav.intern": "实习经历",
        "home.name": "郭家钰", "home.sub": "PERSONAL PORTFOLIO · 个人主页", "home.major": "<span class=\"term\">智能医学工程</span>|<span class=\"term\">脑机接口</span>方向·本科在读", "home.tagline": "Decoding the Brain",
        "pill.music": "🎵 音乐", "pill.instrument": "🎸 乐器", "pill.cat": "🐱 猫", "pill.early": "⏰ 讨厌早起",
        "home.hobTitle": "我喜欢的", "home.emojiHint": "猫 · 钢琴 · 各种乐器 · 音乐",
        "info.title": "个人信息 👤", "info.role": "身份", "info.roleV": "学生 · 大学新生",
        "info.doing": "正在做", "info.doingV": "大一课程的学习",
        "info.interest": "兴趣", "info.interestV": "音乐、乐器、猫",
        "info.trait": "一个特点", "info.traitV": "超级讨厌早起 😴",
        "info.guest": "主页访客", "info.guestV": "同学、老师、亲人、访客",
        "info.quote": "“正在学习大学课程的大一新生，重点在把课程学好，平常也喜欢音乐、猫和乐器。”",
        "chat.head": "郭家钰的数字分身 🤖", "chat.sub": "我在线上，问问我吧", "chat.online": "在线",
        "chat.suggest1": "你是谁？", "chat.suggest2": "你在干什么？",
        "chat.suggest3": "你关心的方向有什么？", "chat.suggest4": "你有什么兴趣爱好？",
        "chat.ph": "向数字分身提问…", "chat.send": "发送", "chat.welcome": "你好呀，我是郭家钰的数字分身 👋 想知道我在做什么、关心什么，或者就当聊聊天，都可以直接问我～",
        "contact.title": "联系我 📮", "contact.tju": "邮箱 · tju", "contact.polyu": "邮箱 · polyu", "contact.personal": "个人邮箱",
        "projects.title": "项目展示 🚀",
        "projects.p1Title": "我的学业进度", "projects.p1Sub": "课程学习走到哪一步", "projects.p1Status": "大一上 · 进行中",
        "projects.p1Detail": "目前处于「大一上 · 进行中 ing」阶段，正按课程节奏推进。",
        "projects.p1Li1": "✅ 大一上 — 进行中（当前）", "projects.p1Li2": "⏳ 大一寒假 — 未开始", "projects.p1Li3": "⏳ 大一下 — 未开始",
        "projects.p2Title": "学习项目与实践", "projects.p2Sub": "课程实践与自学进展", "projects.p2Status": "进阶中",
        "projects.p2Detail": "听课、写代码、读论文摘要，按「进阶中 → 计划中 → 日常」推进。",
        "projects.p2Li1": "[进阶中] 课程实践：线性代数与矩阵运算（为后续<span class=\"term\">脑电信号</span>矩阵处理打基础）",
        "projects.p2Li2": "[进阶中] <span class=\"term\">Python</span>基础编程与信号处理入门",
        "projects.p2Li3": "[计划中] <span class=\"term\">脑电信号（EEG）</span>数据分析小项目、尝试<span class=\"term\">OpenBCI</span>模拟数据跑通滤波算法",
        "projects.p2Li4": "[日常] 阅读<span class=\"term\">脑机接口</span>科普与论文摘要的读书笔记",
        "projects.p3Title": "我的学习成果", "projects.p3Sub": "成绩、证书与作品", "projects.p3Status": "积累中",
        "projects.p3Detail": "持续积累中，后续将更新编程代码 Demo、实验报告与相关证书。",
        "suggest.title": "给我的建议和留言 💬", "suggest.tip": "告诉我你的身份和想给的建议方向，再写几句话～",
        "suggest.roleLabel": "我是谁", "suggest.dirLabel": "建议方向", "suggest.msgLabel": "留言内容",
        "suggest.msgPh": "写几句想对我说的话、给我的建议…", "suggest.submit": "提交留言",
        "suggest.note": "🔒 反馈不会公开，只有我能看到", "suggest.saving": "正在提交…",
        "suggest.success": "已收到，谢谢！只有我能看到你的反馈 ✅",
        "suggest.fail": "提交失败，请检查网络后重试（内容已保留）",
        "suggest.notReady": "反馈后台还没配置好，暂时无法提交 🙏",
        "message.fallback": "这个问题我暂时还没学会回答诶，你可以问我：我是谁、我在干什么、我关心的方向，或者我的兴趣爱好～",
        "role.classmate": "同学", "role.teacher": "老师", "role.family": "亲人", "role.friend": "朋友", "role.visitor": "访客",
        "dir.study": "学业", "dir.music": "音乐", "dir.life": "生活", "dir.other": "其他",
        "edu.title": "教育背景 🎓",
        "edu.school1": "天津大学香港理工大学深圳未来技术学院", "edu.major1": "大一(在读)", "edu.meta1": "本科 · 2026 入学 · 在读",
        "edu.kMajor": "专业", "edu.vMajor": "<span class=\"term\">智能医学工程</span>",
        "edu.kTrack": "方向", "edu.vTrack": "<span class=\"term\">脑机接口</span>",
        "edu.kCore": "核心课程", "edu.core1": "微积分", "edu.core2": "线性代数",
        "edu.kProject": "项目制课程", "edu.project1": "计算机科学与技术及人工智能基础", "edu.project2": "计算机程序设计",
        "intern.title": "实习经历 💼",
        "intern.role1": "暂无实习经历", "intern.org1": "大一阶段,尚未参加实习", "intern.status1": "未进行",
        "intern.note": "有了实习经历会第一时间更新到这里 ✨",
        "footer": "郭家钰 · 个人主页第一版原型 · 简约清新"
      },
      en: {
        "nav.home": "Home", "nav.info": "About", "nav.chat": "Digital Me",
        "nav.contact": "Contact", "nav.projects": "Projects", "nav.suggest": "Feedback",
        "nav.education": "Education", "nav.intern": "Internship",
        "home.name": "Jiayu Guo", "home.sub": "PERSONAL PORTFOLIO", "home.major": "<span class=\"term\">Intelligent Medical Engineering</span> | <span class=\"term\">Brain-Computer Interface</span> · Undergraduate", "home.tagline": "Decoding the Brain",
        "pill.music": "🎵 Music", "pill.instrument": "🎸 Instruments", "pill.cat": "🐱 Cats", "pill.early": "⏰ Hates early mornings",
        "home.hobTitle": "What I Like", "home.emojiHint": "Cat · Piano · Instruments · Music",
        "info.title": "About Me 👤", "info.role": "Identity", "info.roleV": "Student · Freshman",
        "info.doing": "Currently", "info.doingV": "Studying freshman courses",
        "info.interest": "Interests", "info.interestV": "Music, instruments, cats",
        "info.trait": "A trait", "info.traitV": "Really hates early mornings 😴",
        "info.guest": "Visitors", "info.guestV": "Classmates, teachers, family, visitors",
        "info.quote": "“A freshman studying university courses — focus on doing well, while also loving music, cats and instruments.”",
        "chat.head": "Jiayu Guo's Digital Me 🤖", "chat.sub": "I'm online, ask me anything", "chat.online": "Online",
        "chat.suggest1": "Who are you?", "chat.suggest2": "What are you doing?",
        "chat.suggest3": "What do you care about?", "chat.suggest4": "What are your hobbies?",
        "chat.ph": "Ask the digital me…", "chat.send": "Send", "chat.welcome": "Hi, I'm Jiayu Guo's digital me 👋 Ask what I'm doing, what I care about, or just chat with me～",
        "contact.title": "Contact 📮", "contact.tju": "Email · TJU", "contact.polyu": "Email · PolyU", "contact.personal": "Personal Email",
        "projects.title": "My Projects 🚀",
        "projects.p1Title": "Academic Progress", "projects.p1Sub": "Where my studies stand", "projects.p1Status": "Year 1 Sem 1 · Ongoing",
        "projects.p1Detail": "I'm currently in the 'Year 1 · Sem 1 — ongoing' stage, following the course pace.",
        "projects.p1Li1": "✅ Year 1 Sem 1 — Ongoing (now)", "projects.p1Li2": "⏳ Year 1 Winter — Not started", "projects.p1Li3": "⏳ Year 1 Sem 2 — Not started",
        "projects.p2Title": "Study Projects & Practice", "projects.p2Sub": "Course practice & self-study progress", "projects.p2Status": "In progress",
        "projects.p2Detail": "Courses, code and paper abstracts — moving through stages: in progress → planned → routine.",
        "projects.p2Li1": "[Advanced] Course practice: linear algebra & matrix operations (foundation for later <span class=\"term\">EEG</span> matrix processing)",
        "projects.p2Li2": "[Advanced] <span class=\"term\">Python</span> basics and an introduction to signal processing",
        "projects.p2Li3": "[Planned] A small <span class=\"term\">EEG</span> data-analysis project — trying to run filtering algorithms on <span class=\"term\">OpenBCI</span> simulated data",
        "projects.p2Li4": "[Routine] Reading notes on <span class=\"term\">BCI</span> popular science and paper abstracts",
        "projects.p3Title": "Learning Achievements", "projects.p3Sub": "Grades, certificates & works", "projects.p3Status": "Accumulating",
        "projects.p3Detail": "Still accumulating — code demos, lab reports and related certificates will be added here later.",
        "suggest.title": "Suggestions & Messages 💬", "suggest.tip": "Tell me who you are and a topic, then leave a few words～",
        "suggest.roleLabel": "I am", "suggest.dirLabel": "Topic", "suggest.msgLabel": "Message",
        "suggest.msgPh": "Write a few words for me, or give me some advice…", "suggest.submit": "Submit",
        "suggest.note": "🔒 Your feedback is private — only I can see it", "suggest.saving": "Submitting…",
        "suggest.success": "Received — thank you! Only I can see your feedback ✅",
        "suggest.fail": "Submission failed. Please check your network and try again (your text is kept).",
        "suggest.notReady": "The feedback backend isn't configured yet 🙏",
        "message.fallback": "I haven't learned to answer that yet. Try asking me: who I am, what I'm doing, what I care about, or my hobbies～",
        "role.classmate": "Classmate", "role.teacher": "Teacher", "role.family": "Family", "role.friend": "Friend", "role.visitor": "Visitor",
        "dir.study": "Study", "dir.music": "Music", "dir.life": "Life", "dir.other": "Other",
        "edu.title": "Education 🎓",
        "edu.school1": "Tianjin University & PolyU Shenzhen Future Technology College", "edu.major1": "Freshman (studying)", "edu.meta1": "Bachelor · Enrolled 2026 · Ongoing",
        "edu.kMajor": "Major", "edu.vMajor": "<span class=\"term\">Intelligent Medical Engineering</span>",
        "edu.kTrack": "Track", "edu.vTrack": "<span class=\"term\">Brain-Computer Interface</span>",
        "edu.kCore": "Core Courses", "edu.core1": "Calculus", "edu.core2": "Linear Algebra",
        "edu.kProject": "Project Courses", "edu.project1": "Computer Science & AI Fundamentals", "edu.project2": "Computer Programming",
        "intern.title": "Internship 💼",
        "intern.role1": "No internship yet", "intern.org1": "Still a freshman, no internship yet", "intern.status1": "Not started",
        "intern.note": "I'll update this here as soon as I have an internship ✨",
        "footer": "Jiayu Guo · Personal Site v1 · Minimal & Fresh"
      }
    };
    function t(key) {
      return T[I18N.lang][key] !== undefined ? T[I18N.lang][key] : T.zh[key];
    }
    function applyLang(lang) {
      I18N.lang = lang;
      try { localStorage.setItem("ds_lang", lang); } catch (e) {}
      document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
      // 静态文本
      document.querySelectorAll("[data-i18n]").forEach(function (el) {
        const k = el.getAttribute("data-i18n");
        if (T[lang][k] !== undefined) el.innerHTML = T[lang][k];
      });
      // placeholder
      document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
        const k = el.getAttribute("data-i18n-placeholder");
        if (T[lang][k] !== undefined) el.setAttribute("placeholder", T[lang][k]);
      });
      // 切换按钮文案
      const btn = document.getElementById("langToggle");
      if (btn) btn.textContent = LANG[lang].btn;
      // 欢迎语 & 空态动态部分
      const w = document.querySelector(".msg.bot.welcome");
      if (w) w.textContent = t("chat.welcome");
      // 反馈提交状态提示（跟随语言切换）
      const st = document.getElementById("suggestStatus");
      if (st && st.dataset.i18nKey) st.textContent = t(st.dataset.i18nKey);
      // 刷新右下角分页的模块名（语言切换后）
      const pl = document.getElementById("pagerLabel");
      if (pl) {
        const av = document.querySelector(".view.active");
        const id = av ? av.id : "view-home";
        const key = "nav." + id.replace("view-", "");
        pl.textContent = T[lang][key] || (id === "view-home" ? "主页" : T.zh[key] || "");
      }
    }

    // 语言切换按钮
    (function () {
      const btn = document.getElementById("langToggle");
      if (!btn) return;
      btn.textContent = LANG[I18N.lang].btn;
      btn.addEventListener("click", function () {
        applyLang(I18N.lang === "zh" ? "en" : "zh");
      });
    })();

    // ---- 日间 / 夜间主题系统 ----
    function applyTheme(theme) {
      I18N.theme = theme;
      try { localStorage.setItem("ds_theme", theme); } catch (e) {}
      document.documentElement.setAttribute("data-theme", theme);
      const btn = document.getElementById("themeToggle");
      if (btn) btn.textContent = theme === "night" ? "日间" : "夜间";
    }
    (function () {
      const btn = document.getElementById("themeToggle");
      if (!btn) return;
      applyTheme(I18N.theme);
      btn.addEventListener("click", function () {
        applyTheme(I18N.theme === "day" ? "night" : "day");
      });
    })();

    // ---- 数字分身知识库 ----
    const knowledge = [
      { keys: ["你是谁", "你是谁？", "介绍", "identity", "name", "名字", "who are you"],
        reply: "我是郭家钰的数字分身呀 🙂 本尊是一名正在学习大学课程的大一新生，你可以把我想成在线版的郭家钰。",
        en: "I'm Jiayu Guo's digital me 🙂 The real me is a freshman studying university courses — think of me as an online version of Jiayu." },
      { keys: ["干什么", "做什么", "最近", "忙", "doing", "学习", "课程", "what are you doing"],
        reply: "我现在主要在做一件事：把大一课程学好 📚 正是课程学习最需要专注的时候呢。",
        en: "Right now I'm mainly doing one thing: getting my freshman courses done 📚 It's the time I need to focus most." },
      { keys: ["关心", "方向", "擅长", "兴趣", "focus", "科目", "care about"],
        reply: "我比较关心的方向是课程学习本身，平时也挺喜欢音乐、乐器和猫 🎵🐱 学习和爱好都会兼顾。",
        en: "I care most about my course studies, and I also love music, instruments and cats 🎵🐱 I balance study and hobbies." },
      { keys: ["兴趣", "爱好", "音乐", "乐器", "猫", "hobby"],
        reply: "我的兴趣有：音乐、乐器和猫 🎸🐱 有空的时候就会沉浸在音乐里，或者撸撸猫。",
        en: "My hobbies: music, instruments and cats 🎸🐱 I get lost in music or pet a cat in my free time." },
      { keys: ["特点", "记忆点", "早起", "起床", "性格", "trait"],
        reply: "我有个挺明显的记忆点——超级讨厌早起 😴 早上能多赖一会儿是一会儿。",
        en: "A memorable trait: I really hate early mornings 😴 I'll stay in bed a bit longer whenever I can." },
      { keys: ["你好", "hi", "hello", "在吗", "hey"],
        reply: "你好呀 👋 我是郭家钰的数字分身，有什么想问的都可以问我哦。",
        en: "Hi there 👋 I'm Jiayu Guo's digital me, feel free to ask me anything." },
      { keys: ["会什么", "能力", "帮", "笔记", "学习建议", "help"],
        reply: "我现在主要是陪你聊天、介绍我自己。关于大一课程学习，我可以说说我是怎么安排和专注学习的。",
        en: "I mainly chat with you and introduce myself. For freshman course study, I can share how I plan and focus." },
      { keys: ["谢谢", "感谢", "thanks"],
        reply: "不客气～ 有需要随时来问我 😊",
        en: "You're welcome～ Happy to help anytime 😊" }
    ];
    function fallbackReply() { return t("message.fallback"); }

    // ---- 聊天逻辑 ----
    const messages = document.getElementById("messages");
    const input = document.getElementById("input");
    const send = document.getElementById("send");
    const suggest = document.getElementById("suggest");

    function addMsg(text, who, typing) {
      const div = document.createElement("div");
      div.className = "msg " + who + (typing ? " typing" : "");
      div.textContent = text;
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
      return div;
    }

    function replyTo(text) {
      const tq = text.trim().toLowerCase();
      for (const k of knowledge) {
        if (k.keys.some(function (x) { return tq.includes(x); })) {
          return I18N.lang === "en" ? k.en : k.reply;
        }
      }
      return fallbackReply();
    }

    function botReply(text) {
      const typing = addMsg("…", "bot", true);
      setTimeout(() => {
        typing.remove();
        addMsg(replyTo(text), "bot");
      }, 550);
    }

    function sendUser(text) {
      if (text.trim() === "") return;
      addMsg(text, "user");
      input.value = "";
      botReply(text);
    }

    send.addEventListener("click", () => sendUser(input.value));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendUser(input.value);
    });
    suggest.addEventListener("click", (e) => {
      if (e.target.classList.contains("suggest-btn")) sendUser(e.target.dataset.q);
    });

    // 欢迎语
    const welcome = addMsg(t("chat.welcome"), "bot");
    welcome.classList.add("welcome");

    // ---- 视图切换：主页侧栏 / 右下角分页 ----
    (function () {
      const sideItems = document.querySelectorAll(".side-item");
      const views = document.querySelectorAll(".view");
      const ORDER = ["view-home", "view-info", "view-chat", "view-contact",
                     "view-projects", "view-suggest", "view-education", "view-intern"];
      function activate(id, source) {
        views.forEach(v => v.classList.toggle("active", v.id === id));
        sideItems.forEach(s => s.classList.toggle("active", s === source || s.getAttribute("data-target") === id));
        syncPager(id);
      }
      // ---- 右下角分页按钮 ----
      const pagerPrev = document.getElementById("pagerPrev");
      const pagerNext = document.getElementById("pagerNext");
      const pagerHome = document.getElementById("pagerHome");
      function currentIndex() {
        const has = document.querySelector(".view.active");
        return has ? ORDER.indexOf(has.id) : 0;
      }
      function syncPager(id) {
        const pagerLabel = document.getElementById("pagerLabel");
        if (pagerLabel) {
          const key = "nav." + (id.replace("view-", ""));
          pagerLabel.textContent = T[I18N.lang][key] || (id === "view-home" ? "主页" : T.zh[key] || id);
        }
        if (!pagerPrev || !pagerNext) return;
        const idx = ORDER.indexOf(id);
        pagerPrev.disabled = (idx <= 0);
        pagerNext.disabled = (idx < 0 || idx >= ORDER.length - 1);
      }
      if (pagerPrev) pagerPrev.addEventListener("click", () => {
        const i = currentIndex();
        if (i > 0) activate(ORDER[i - 1]);
      });
      if (pagerNext) pagerNext.addEventListener("click", () => {
        const i = currentIndex();
        if (i >= 0 && i < ORDER.length - 1) activate(ORDER[i + 1]);
      });
      if (pagerHome) pagerHome.addEventListener("click", () => activate("view-home"));
      // ---- 主页封面弧形索引栏 ----
      sideItems.forEach(item => {
        item.addEventListener("click", (e) => {
          e.preventDefault();
          activate(item.getAttribute("data-target"), item);
        });
      });
      // 初始激活：默认打开主页
      const homeSide = document.querySelector(".side-item[data-target='view-home']");
      if (homeSide) activate("view-home", homeSide);
      else activate("view-home");
    })();

    // ---- 右侧 emoji 轮流出现 ----
    (function () {
      const emojis = ["🐱", "🎹", "🐈", "🎸", "🎻", "🎷", "🎺", "🎤", "🥁", "🎼", "🎶", "🎵", "🐾"];
      const el = document.getElementById("emoji");
      if (!el) return;
      let i = 0;
      setInterval(() => {
        el.classList.add("swap");
        setTimeout(() => {
          i = (i + 1) % emojis.length;
          el.textContent = emojis[i];
          el.classList.remove("swap");
        }, 400);
      }, 2600);
    })();

    // ---- 给我的建议和留言（V3：写入 Supabase 后台）----
    (function () {
      const form = document.getElementById("suggestForm");
      const roleSel = document.getElementById("sRole");
      const dirSel = document.getElementById("sDir");
      const textEl = document.getElementById("sText");
      const statusEl = document.getElementById("suggestStatus");
      const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

      if (!form) return;

      // 提交状态提示（切换语言时会按 data-i18n-key 重新渲染）
      function setStatus(key, kind) {
        if (!statusEl) return;
        statusEl.dataset.i18nKey = key || "";
        statusEl.textContent = key ? t(key) : "";
        statusEl.className = "suggest-status" + (kind ? " is-" + kind : "");
      }

      form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const message = textEl.value.trim();
        if (!message) { textEl.focus(); return; }

        // 后台未配置时直接提示，不发起请求
        if (!db) { setStatus("suggest.notReady", "error"); return; }

        // 按数据库 feedback 表的字段组织数据
        const payload = {
          name: null,                                 // 当前表单暂无昵称字段，留空
          relation: roleSel ? roleSel.value : null,   // 我是谁 -> relation
          topic: dirSel ? dirSel.value : null,        // 建议方向 -> topic
          device: detectDevice(),                     // 自动识别访客设备
          message: message,                           // 留言内容 -> message
          version: SITE_VERSION                       // 网站版本，自动附带
        };

        // 提交中：按钮禁用，防止重复点击
        if (submitBtn) submitBtn.disabled = true;
        setStatus("suggest.saving", "pending");

        try {
          // 只 insert、不 select：匿名访客没有读取权限
          const { error } = await db.from(FEEDBACK_TABLE).insert(payload);
          if (error) throw error;

          form.reset();
          setStatus("suggest.success", "ok");
        } catch (err) {
          console.error("[反馈后台] 提交失败：", err);
          // 失败时保留已输入内容，仅提示重试
          setStatus("suggest.fail", "error");
        } finally {
          if (submitBtn) submitBtn.disabled = false;
        }
      });
    })();

    // 初始化语言
    applyLang(I18N.lang);
