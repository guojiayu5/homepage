    // ============================================================
    //  V3 反馈后台配置（Supabase）
    //  把下面两个值替换成你自己的，获取位置：Supabase 控制台 -> Settings -> API
    //
    //  【可以公开】这两个值放在前端是安全的
    //  【绝对不要填】secret key / service_role key 绝不能出现在这里
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
    // ==== 内联 SVG 图标（Lucide 24×24，stroke=currentColor 跟随文字颜色）====
    // index.html 里静态的部分直接写死 <svg>；这里只服务「由 JS 渲染」的文案：
    //   · data-i18n 的元素按 innerHTML 渲染  -> 文案里可以直接拼 IC("music")
    //   · 聊天消息默认走 textContent          -> 需 addMsg(..., true) 才会解析 HTML
    const IPATH = {
      handshake: '<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/>',
      smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/>',
      "book-open": '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
      music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
      guitar: '<path d="m11.9 12.1 4.514-4.514"/><path d="M20.1 2.3a1 1 0 0 0-1.4 0l-1.114 1.114A2 2 0 0 0 17 4.828v1.344a2 2 0 0 1-.586 1.414A2 2 0 0 1 17.828 7h1.344a2 2 0 0 0 1.414-.586L21.7 5.3a1 1 0 0 0 0-1.4z"/><path d="m6 16 2 2"/><path d="M8.23 9.85A3 3 0 0 1 11 8a5 5 0 0 1 5 5 3 3 0 0 1-1.85 2.77l-.92.38A2 2 0 0 0 12.96 18a2 2 0 0 1-3.9.6l-.38-.92A3 3 0 0 1 6 16a5 5 0 0 1 2.23-6.15"/>',
      cat: '<path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5Z"/><path d="M8 14v.5"/><path d="M16 14v.5"/><path d="M11.25 16.25h1.5L12 17l-.75-.75Z"/>',
      "bed-single": '<path d="M3 20v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8"/><path d="M5 10V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/><path d="M3 18h18"/>',
      check: '<path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/>',
      hourglass: '<path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>',
      sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',
      alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>'
    };
    function IC(name) {
      return '<svg class="lu-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (IPATH[name] || "") + "</svg>";
    }
    const T = {
      zh: {
        "nav.home": "主页", "nav.info": "个人信息", "nav.chat": "数字分身",
        "nav.contact": "联系我", "nav.projects": "项目展示", "nav.suggest": "建议留言",
        "nav.education": "教育背景", "nav.intern": "实习经历",
        "home.name": "郭家钰", "home.sub": "PERSONAL PORTFOLIO · 个人主页", "home.major": "<span class=\"term\">智能医学工程</span>|<span class=\"term\">脑机接口</span>方向·本科在读", "home.tagline": "Decoding the Brain",
        "pill.music": IC("music") + " 音乐", "pill.instrument": IC("guitar") + " 乐器", "pill.cat": IC("cat") + " 猫", "pill.early": IC("bed-single") + " 讨厌早起",
        "home.hobTitle": "我喜欢的", "home.emojiHint": "猫 · 钢琴 · 各种乐器 · 音乐",
        "info.title": "个人信息", "info.role": "身份", "info.roleV": "学生 · 大学新生",
        "info.doing": "正在做", "info.doingV": "大一课程的学习",
        "info.interest": "兴趣", "info.interestV": "音乐、乐器、猫",
        "info.trait": "一个特点", "info.traitV": "超级讨厌早起",
        "info.guest": "主页访客", "info.guestV": "同学、老师、亲人、访客",
        "info.quote": "“正在学习大学课程的大一新生，重点在把课程学好，平常也喜欢音乐、猫和乐器。”",
        "chat.head": "郭家钰的数字分身", "chat.sub": "我在线上，问问我吧", "chat.online": "在线",
        "chat.suggest1": "你是谁？", "chat.suggest2": "你在干什么？",
        "chat.suggest3": "你关心的方向有什么？", "chat.suggest4": "你有什么兴趣爱好？",
        "chat.ph": "向数字分身提问…", "chat.send": "发送", "chat.welcome": "你好呀，我是郭家钰的数字分身 " + IC("handshake") + " 想知道我在做什么、关心什么，或者就当聊聊天，都可以直接问我～",
        "contact.title": "联系我", "contact.tju": "邮箱 · tju", "contact.polyu": "邮箱 · polyu", "contact.personal": "个人邮箱",
        "projects.title": "项目展示",
        "projects.p1Title": "我的学业进度", "projects.p1Sub": "课程学习走到哪一步", "projects.p1Status": "大一上 · 进行中",
        "projects.p1Detail": "目前处于「大一上 · 进行中 ing」阶段，正按课程节奏推进。",
        "projects.p1Li1": IC("check") + " 大一上 — 进行中（当前）", "projects.p1Li2": IC("hourglass") + " 大一寒假 — 未开始", "projects.p1Li3": IC("hourglass") + " 大一下 — 未开始",
        "projects.p2Title": "学习项目与实践", "projects.p2Sub": "课程实践与自学进展", "projects.p2Status": "进阶中",
        "projects.p2Detail": "听课、写代码、读论文摘要，按「进阶中 → 计划中 → 日常」推进。",
        "projects.p2Li1": "[进阶中] 课程实践：线性代数与矩阵运算（为后续<span class=\"term\">脑电信号</span>矩阵处理打基础）",
        "projects.p2Li2": "[进阶中] <span class=\"term\">Python</span>基础编程与信号处理入门",
        "projects.p2Li3": "[计划中] <span class=\"term\">脑电信号（EEG）</span>数据分析小项目、尝试<span class=\"term\">OpenBCI</span>模拟数据跑通滤波算法",
        "projects.p2Li4": "[日常] 阅读<span class=\"term\">脑机接口</span>科普与论文摘要的读书笔记",
        "projects.p3Title": "我的学习成果", "projects.p3Sub": "成绩、证书与作品", "projects.p3Status": "积累中",
        "projects.p3Detail": "持续积累中，后续将更新编程代码 Demo、实验报告与相关证书。",
        "suggest.title": "给我的建议和留言", "suggest.tip": "告诉我你的身份和想给的建议方向，再写几句话～",
        "suggest.roleLabel": "我是谁", "suggest.dirLabel": "建议方向", "suggest.msgLabel": "留言内容",
        "suggest.nameLabel": "昵称（选填）", "suggest.namePh": "怎么称呼你（可留空）",
        "suggest.msgPh": "写几句想对我说的话、给我的建议…", "suggest.submit": "提交留言",
        "suggest.note": "反馈不会公开，只有我能看到", "suggest.saving": "正在提交…",
        "suggest.success": "已收到，谢谢！只有我能看到你的反馈 " + IC("check"),
        "suggest.fail": "提交失败，请检查网络后重试（内容已保留）",
        "suggest.notReady": IC("alert") + " 反馈后台还没配置好，暂时无法提交",
        "message.fallback": "这个问题我暂时还没学会回答诶，你可以问我：我是谁、我在干什么、我关心的方向，或者我的兴趣爱好～",
        "role.classmate": "同学", "role.teacher": "老师", "role.family": "亲人", "role.friend": "朋友", "role.visitor": "访客",
        "dir.study": "学业", "dir.music": "音乐", "dir.life": "生活", "dir.other": "其他",
        "edu.title": "教育背景",
        "edu.school1": "天津大学香港理工大学深圳未来技术学院", "edu.major1": "大一(在读)", "edu.meta1": "本科 · 2026 入学 · 在读",
        "edu.kMajor": "专业", "edu.vMajor": "<span class=\"term\">智能医学工程</span>",
        "edu.kTrack": "方向", "edu.vTrack": "<span class=\"term\">脑机接口</span>",
        "edu.kCore": "核心课程", "edu.core1": "微积分", "edu.core2": "线性代数",
        "edu.kProject": "项目制课程", "edu.project1": "计算机科学与技术及人工智能基础", "edu.project2": "计算机程序设计",
        "intern.title": "实习经历",
        "intern.role1": "暂无实习经历", "intern.org1": "大一阶段,尚未参加实习", "intern.status1": "未进行",
        "intern.note": "有了实习经历会第一时间更新到这里 " + IC("sparkles"),
        "footer": "郭家钰 · 个人主页第一版原型 · 简约清新"
      },
      en: {
        "nav.home": "Home", "nav.info": "About", "nav.chat": "Digital Me",
        "nav.contact": "Contact", "nav.projects": "Projects", "nav.suggest": "Feedback",
        "nav.education": "Education", "nav.intern": "Internship",
        "home.name": "Jiayu Guo", "home.sub": "PERSONAL PORTFOLIO", "home.major": "<span class=\"term\">Intelligent Medical Engineering</span> | <span class=\"term\">Brain-Computer Interface</span> · Undergraduate", "home.tagline": "Decoding the Brain",
        "pill.music": IC("music") + " Music", "pill.instrument": IC("guitar") + " Instruments", "pill.cat": IC("cat") + " Cats", "pill.early": IC("bed-single") + " Hates early mornings",
        "home.hobTitle": "What I Like", "home.emojiHint": "Cat · Piano · Instruments · Music",
        "info.title": "About Me", "info.role": "Identity", "info.roleV": "Student · Freshman",
        "info.doing": "Currently", "info.doingV": "Studying freshman courses",
        "info.interest": "Interests", "info.interestV": "Music, instruments, cats",
        "info.trait": "A trait", "info.traitV": "Really hates early mornings",
        "info.guest": "Visitors", "info.guestV": "Classmates, teachers, family, visitors",
        "info.quote": "“A freshman studying university courses — focus on doing well, while also loving music, cats and instruments.”",
        "chat.head": "Jiayu Guo's Digital Me", "chat.sub": "I'm online, ask me anything", "chat.online": "Online",
        "chat.suggest1": "Who are you?", "chat.suggest2": "What are you doing?",
        "chat.suggest3": "What do you care about?", "chat.suggest4": "What are your hobbies?",
        "chat.ph": "Ask the digital me…", "chat.send": "Send", "chat.welcome": "Hi, I'm Jiayu Guo's digital me " + IC("handshake") + " Ask what I'm doing, what I care about, or just chat with me～",
        "contact.title": "Contact", "contact.tju": "Email · TJU", "contact.polyu": "Email · PolyU", "contact.personal": "Personal Email",
        "projects.title": "My Projects",
        "projects.p1Title": "Academic Progress", "projects.p1Sub": "Where my studies stand", "projects.p1Status": "Year 1 Sem 1 · Ongoing",
        "projects.p1Detail": "I'm currently in the 'Year 1 · Sem 1 — ongoing' stage, following the course pace.",
        "projects.p1Li1": IC("check") + " Year 1 Sem 1 — Ongoing (now)", "projects.p1Li2": IC("hourglass") + " Year 1 Winter — Not started", "projects.p1Li3": IC("hourglass") + " Year 1 Sem 2 — Not started",
        "projects.p2Title": "Study Projects & Practice", "projects.p2Sub": "Course practice & self-study progress", "projects.p2Status": "In progress",
        "projects.p2Detail": "Courses, code and paper abstracts — moving through stages: in progress → planned → routine.",
        "projects.p2Li1": "[Advanced] Course practice: linear algebra & matrix operations (foundation for later <span class=\"term\">EEG</span> matrix processing)",
        "projects.p2Li2": "[Advanced] <span class=\"term\">Python</span> basics and an introduction to signal processing",
        "projects.p2Li3": "[Planned] A small <span class=\"term\">EEG</span> data-analysis project — trying to run filtering algorithms on <span class=\"term\">OpenBCI</span> simulated data",
        "projects.p2Li4": "[Routine] Reading notes on <span class=\"term\">BCI</span> popular science and paper abstracts",
        "projects.p3Title": "Learning Achievements", "projects.p3Sub": "Grades, certificates & works", "projects.p3Status": "Accumulating",
        "projects.p3Detail": "Still accumulating — code demos, lab reports and related certificates will be added here later.",
        "suggest.title": "Suggestions & Messages", "suggest.tip": "Tell me who you are and a topic, then leave a few words～",
        "suggest.roleLabel": "I am", "suggest.dirLabel": "Topic", "suggest.msgLabel": "Message",
        "suggest.nameLabel": "Nickname (optional)", "suggest.namePh": "What should I call you? (optional)",
        "suggest.msgPh": "Write a few words for me, or give me some advice…", "suggest.submit": "Submit",
        "suggest.note": "Your feedback is private — only I can see it", "suggest.saving": "Submitting…",
        "suggest.success": "Received — thank you! Only I can see your feedback " + IC("check"),
        "suggest.fail": "Submission failed. Please check your network and try again (your text is kept).",
        "suggest.notReady": IC("alert") + " The feedback backend isn't configured yet",
        "message.fallback": "I haven't learned to answer that yet. Try asking me: who I am, what I'm doing, what I care about, or my hobbies～",
        "role.classmate": "Classmate", "role.teacher": "Teacher", "role.family": "Family", "role.friend": "Friend", "role.visitor": "Visitor",
        "dir.study": "Study", "dir.music": "Music", "dir.life": "Life", "dir.other": "Other",
        "edu.title": "Education",
        "edu.school1": "Tianjin University & PolyU Shenzhen Future Technology College", "edu.major1": "Freshman (studying)", "edu.meta1": "Bachelor · Enrolled 2026 · Ongoing",
        "edu.kMajor": "Major", "edu.vMajor": "<span class=\"term\">Intelligent Medical Engineering</span>",
        "edu.kTrack": "Track", "edu.vTrack": "<span class=\"term\">Brain-Computer Interface</span>",
        "edu.kCore": "Core Courses", "edu.core1": "Calculus", "edu.core2": "Linear Algebra",
        "edu.kProject": "Project Courses", "edu.project1": "Computer Science & AI Fundamentals", "edu.project2": "Computer Programming",
        "intern.title": "Internship",
        "intern.role1": "No internship yet", "intern.org1": "Still a freshman, no internship yet", "intern.status1": "Not started",
        "intern.note": "I'll update this here as soon as I have an internship " + IC("sparkles"),
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
      if (w) w.innerHTML = t("chat.welcome");   // 欢迎语内含 SVG 图标，须按 HTML 渲染
      // 反馈提交状态提示（跟随语言切换）
      const st = document.getElementById("suggestStatus");
      if (st && st.dataset.i18nKey) st.innerHTML = t(st.dataset.i18nKey);   // 状态提示里含 SVG 图标
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
        reply: "我是郭家钰的数字分身呀 " + IC("smile") + " 本尊是一名正在学习大学课程的大一新生，你可以把我想成在线版的郭家钰。",
        en: "I'm Jiayu Guo's digital me " + IC("smile") + " The real me is a freshman studying university courses — think of me as an online version of Jiayu." },
      { keys: ["干什么", "做什么", "最近", "忙", "doing", "学习", "课程", "what are you doing"],
        reply: "我现在主要在做一件事：把大一课程学好 " + IC("book-open") + " 正是课程学习最需要专注的时候呢。",
        en: "Right now I'm mainly doing one thing: getting my freshman courses done " + IC("book-open") + " It's the time I need to focus most." },
      { keys: ["关心", "方向", "擅长", "兴趣", "focus", "科目", "care about"],
        reply: "我比较关心的方向是课程学习本身，平时也挺喜欢音乐、乐器和猫 " + IC("music") + IC("cat") + " 学习和爱好都会兼顾。",
        en: "I care most about my course studies, and I also love music, instruments and cats " + IC("music") + IC("cat") + " I balance study and hobbies." },
      { keys: ["兴趣", "爱好", "音乐", "乐器", "猫", "hobby"],
        reply: "我的兴趣有：音乐、乐器和猫 " + IC("guitar") + IC("cat") + " 有空的时候就会沉浸在音乐里，或者撸撸猫。",
        en: "My hobbies: music, instruments and cats " + IC("guitar") + IC("cat") + " I get lost in music or pet a cat in my free time." },
      { keys: ["特点", "记忆点", "早起", "起床", "性格", "trait"],
        reply: "我有个挺明显的记忆点——超级讨厌早起 " + IC("bed-single") + " 早上能多赖一会儿是一会儿。",
        en: "A memorable trait: I really hate early mornings " + IC("bed-single") + " I'll stay in bed a bit longer whenever I can." },
      { keys: ["你好", "hi", "hello", "在吗", "hey"],
        reply: "你好呀 " + IC("handshake") + " 我是郭家钰的数字分身，有什么想问的都可以问我哦。",
        en: "Hi there " + IC("handshake") + " I'm Jiayu Guo's digital me, feel free to ask me anything." },
      { keys: ["会什么", "能力", "帮", "笔记", "学习建议", "help"],
        reply: "我现在主要是陪你聊天、介绍我自己。关于大一课程学习，我可以说说我是怎么安排和专注学习的。",
        en: "I mainly chat with you and introduce myself. For freshman course study, I can share how I plan and focus." },
      { keys: ["谢谢", "感谢", "thanks"],
        reply: "不客气～ 有需要随时来问我 " + IC("smile"),
        en: "You're welcome～ Happy to help anytime " + IC("smile") }
    ];
    function fallbackReply() { return t("message.fallback"); }

    // ---- 聊天逻辑 ----
    const messages = document.getElementById("messages");
    const input = document.getElementById("input");
    const send = document.getElementById("send");
    const suggest = document.getElementById("suggest");

    // asHtml 只给机器人固定文案用（要内嵌 SVG 图标）；用户输入一律 textContent，避免 XSS
    function addMsg(text, who, typing, asHtml) {
      const div = document.createElement("div");
      div.className = "msg " + who + (typing ? " typing" : "");
      if (asHtml) div.innerHTML = text;
      else div.textContent = text;
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
        addMsg(replyTo(text), "bot", false, true);   // 知识库回答里也含 SVG 图标
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
    const welcome = addMsg(t("chat.welcome"), "bot", false, true);
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

    // ---- 给我的建议和留言（V3：写入 Supabase 后台）----
    (function () {
      const form = document.getElementById("suggestForm");
      const roleSel = document.getElementById("sRole");
      const dirSel = document.getElementById("sDir");
      const nameEl = document.getElementById("sName");
      const textEl = document.getElementById("sText");
      const statusEl = document.getElementById("suggestStatus");
      const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

      if (!form) return;

      // 提交状态提示（切换语言时会按 data-i18n-key 重新渲染）
      function setStatus(key, kind) {
        if (!statusEl) return;
        statusEl.dataset.i18nKey = key || "";
        statusEl.innerHTML = key ? t(key) : "";   // 状态提示里可能带图标
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
          name: (nameEl && nameEl.value.trim()) ? nameEl.value.trim() : null,  // 昵称（选填）：留空存 null
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
