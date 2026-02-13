// 国学学习应用 - Canvas 渲染引擎
(function() {
    'use strict';

    // ============ 全局配置 ============
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    let screenWidth = window.innerWidth;
    let screenHeight = window.innerHeight;
    let dpr = window.devicePixelRatio || 1;

    // 应用状态
    const AppState = {
        MENU: 'menu',
        STUDY: 'study',
        POEM: 'poem',
        STUDY_LIST: 'studyList',
        POEM_LIST: 'poemList',
        SETTINGS: 'settings'
    };

    let currentState = AppState.STUDY;
    let previousState = AppState.STUDY;  // 记录设置前的状态
    let currentIndex = 0;
    let currentData = studyData;  // 默认三字经
    let scrollY = 0;
    let maxScrollY = 0;
    let isSpeaking = false;
    let isPaused = false;       // 是否暂停状态
    let lastPlayStrategy = '';  // 记录上次播放使用的策略
    
    // 设置配置
    const settings = {
        // 显示设置
        showExplanation: true,     // 句子解释（默认显示）
        showNotes: true,           // 关键字解释（默认显示）
        showStories: true,         // 故事（默认显示）
        // 播放策略: 'tts'=优先实时生成, 'mp3'=优先本地音频
        playStrategy: 'mp3',
        // 播放内容
        playContent: true,         // 正文（默认播放）
        playExplanation: true,     // 解释（默认播放）
        playNotes: true,           // 注解（默认播放）
        playStories: true,         // 故事（默认播放）
        // 播放模式: 'single', 'chapterLoop', 'allOnce', 'allLoop'
        playMode: 'chapterLoop',
        // 自动停止: 0=不停止, 10, 20, 30, 60(分钟)
        autoStop: 0
    };
    
    // 从本地存储加载设置
    function loadSettings() {
        try {
            const saved = localStorage.getItem('guoxue_settings');
            if (saved) {
                const parsed = JSON.parse(saved);
                // 不恢复 autoStop（每次启动重置为0）
                const savedAutoStop = settings.autoStop;
                Object.assign(settings, parsed);
                settings.autoStop = 0;  // 强制重置为关闭
                console.log('设置已加载:', settings);
            }
        } catch (e) {
            console.error('加载设置失败:', e);
        }
    }
    
    // 保存设置到本地存储
    function saveSettings() {
        try {
            // 不保存 autoStop（每次启动重置为0）
            const toSave = { ...settings };
            delete toSave.autoStop;
            localStorage.setItem('guoxue_settings', JSON.stringify(toSave));
            console.log('设置已保存');
        } catch (e) {
            console.error('保存设置失败:', e);
        }
    }
    
    let autoStopTimer = null;
    let autoStopEndTime = 0;      // 自动停止结束时间戳
    let countdownTimer = null;    // 倒计时更新定时器
    let autoPlayTimeout = null;   // 自动播放下一章定时器
    let expectingTTSEnd = false;  // 是否期待TTS正常结束（用于区分手动停止）
    let playStartTime = 0;
    let touchStartY = 0;
    let touchStartX = 0;
    let lastTouchY = 0;
    let lastTouchTime = 0;
    let velocity = 0;
    let isScrolling = false;

    // 颜色主题
    const colors = {
        background: '#FDF5E6',
        primary: '#6B3A10',       // 深古铜色（标题）
        secondary: '#D4A574',
        text: '#2C1810',          // 深棕色（原文）
        textLight: '#5D4037',     // 咖啡色（解读）
        white: '#FFFFFF',
        border: '#DEB887',
        highlight: '#B8860B',     // 暗金色
        shadow: 'rgba(0,0,0,0.1)',
        title: '#4A2C17',         // 标题专用深褐
        content: '#1A0F0A',       // 正文专用墨色
        explanation: '#6D4C41'    // 解读专用棕色
    };

    // ============ 初始化 ============
    function init() {
        loadSettings();  // 加载本地设置
        resizeCanvas();
        bindEvents();
        render();
        requestAnimationFrame(gameLoop);
    }

    function resizeCanvas() {
        screenWidth = window.innerWidth;
        screenHeight = window.innerHeight;
        canvas.width = screenWidth * dpr;
        canvas.height = screenHeight * dpr;
        canvas.style.width = screenWidth + 'px';
        canvas.style.height = screenHeight + 'px';
        ctx.scale(dpr, dpr);
    }

    // ============ 事件绑定 ============
    function bindEvents() {
        window.addEventListener('resize', () => {
            resizeCanvas();
            render();
        });

        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
        
        // 兼容鼠标事件
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
    }

    let mouseDown = false;

    function handleMouseDown(e) {
        mouseDown = true;
        handleTouchStart({ 
            preventDefault: () => {},
            touches: [{ clientX: e.clientX, clientY: e.clientY }] 
        });
    }

    function handleMouseMove(e) {
        if (mouseDown) {
            handleTouchMove({ 
                preventDefault: () => {},
                touches: [{ clientX: e.clientX, clientY: e.clientY }] 
            });
        }
    }

    function handleMouseUp(e) {
        mouseDown = false;
        handleTouchEnd({ 
            preventDefault: () => {},
            changedTouches: [{ clientX: e.clientX, clientY: e.clientY }] 
        });
    }

    function handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        lastTouchY = touch.clientY;
        lastTouchTime = Date.now();
        velocity = 0;
        isScrolling = false;
    }

    function handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const now = Date.now();
        const deltaY = lastTouchY - touch.clientY;
        const deltaTime = now - lastTouchTime || 16;
        
        if (Math.abs(touch.clientY - touchStartY) > 10) {
            isScrolling = true;
        }
        
        if (isScrolling && maxScrollY > 0) {
            scrollY = Math.max(0, Math.min(maxScrollY, scrollY + deltaY));
            // 计算速度（像素/毫秒），用于惯性 - 增强响应性
            velocity = deltaY / deltaTime * 25;
            render();
        }
        
        lastTouchY = touch.clientY;
        lastTouchTime = now;
    }

    function handleTouchEnd(e) {
        e.preventDefault();
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
        
        // 结束滚动状态，让惯性生效
        isScrolling = false;
        
        // 判断是点击还是滑动
        if (Math.abs(deltaX) < 20 && Math.abs(deltaY) < 20) {
            handleClick(touch.clientX, touch.clientY);
            velocity = 0;  // 点击时清除速度
        } else if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
            // 左右滑动切换
            velocity = 0;  // 左右滑动时清除速度
            if (deltaX > 0) {
                navigatePrev();
            } else {
                navigateNext();
            }
        }
    }

    // ============ 点击处理 ============
    function handleClick(x, y) {
        switch (currentState) {
            case AppState.MENU:
                handleMenuClick(x, y);
                break;
            case AppState.STUDY:
            case AppState.POEM:
                handleContentClick(x, y);
                break;
            case AppState.STUDY_LIST:
            case AppState.POEM_LIST:
                handleListClick(x, y);
                break;
            case AppState.SETTINGS:
                handleSettingsClick(x, y);
                break;
        }
    }

    function handleMenuClick(x, y) {
        const centerX = screenWidth / 2;
        const btnWidth = screenWidth * 0.7;
        const btnHeight = 60;
        
        // 三字经按钮
        const btn1Y = screenHeight * 0.4;
        if (x > centerX - btnWidth/2 && x < centerX + btnWidth/2 &&
            y > btn1Y && y < btn1Y + btnHeight) {
            currentState = AppState.STUDY;
            currentData = studyData;
            currentIndex = 0;
            scrollY = 0;
            render();
            return;
        }
        
        // 古诗词按钮
        const btn2Y = screenHeight * 0.55;
        if (x > centerX - btnWidth/2 && x < centerX + btnWidth/2 &&
            y > btn2Y && y < btn2Y + btnHeight) {
            currentState = AppState.POEM;
            currentData = poemsData;
            currentIndex = 0;
            scrollY = 0;
            render();
            return;
        }
    }

    function handleContentClick(x, y) {
        const footerY = screenHeight - 80;
        
        // 底部栏4列：目录、设置、进度、播放
        if (y > footerY) {
            const btnWidth = screenWidth / 4;
            const btnIndex = Math.floor(x / btnWidth);
            
            switch (btnIndex) {
                case 0: // 目录
                    if (currentState === AppState.STUDY) {
                        currentState = AppState.STUDY_LIST;
                    } else {
                        currentState = AppState.POEM_LIST;
                    }
                    scrollY = 0;
                    render();
                    break;
                case 1: // 进入设置页面
                    previousState = currentState;
                    currentState = AppState.SETTINGS;
                    scrollY = 0;
                    render();
                    break;
                case 2: // 进度（不响应）
                    break;
                case 3: // 播放
                    toggleSpeech();
                    break;
            }
            return;
        }
        
        // 点击内容区域：左边上一个，右边下一个
        if (x < screenWidth / 3) {
            navigatePrev();
        } else if (x > screenWidth * 2 / 3) {
            navigateNext();
        }
    }

    function handleListClick(x, y) {
        const headerHeight = 50;
        const tabHeight = 45;
        
        // 返回按钮
        if (x < 60 && y < headerHeight) {
            if (currentState === AppState.STUDY_LIST) {
                currentState = AppState.STUDY;
            } else {
                currentState = AppState.POEM;
            }
            scrollY = 0;
            render();
            return;
        }
        
        // Tab切换点击
        if (y > headerHeight && y < headerHeight + tabHeight) {
            const tabWidth = screenWidth / 2;
            if (x < tabWidth) {
                // 点击三字经Tab
                currentState = AppState.STUDY_LIST;
                currentData = studyData;
            } else {
                // 点击古诗词Tab
                currentState = AppState.POEM_LIST;
                currentData = poemsData;
            }
            scrollY = 0;
            render();
            return;
        }
        
        // 列表项点击
        const itemHeight = 70;
        const startY = headerHeight + tabHeight + 20;
        const clickedIndex = Math.floor((y + scrollY - startY) / itemHeight);
        
        if (clickedIndex >= 0 && clickedIndex < currentData.length) {
            currentIndex = clickedIndex;
            if (currentState === AppState.STUDY_LIST) {
                currentState = AppState.STUDY;
            } else {
                currentState = AppState.POEM;
            }
            scrollY = 0;
            render();
        }
    }

    // ============ 导航功能 ============
    function goBack() {
        stopSpeech();
        currentState = AppState.MENU;
        scrollY = 0;
        render();
    }

    function navigateToChapter(delta) {
        const newIndex = currentIndex + delta;
        console.log('[navigateToChapter] delta=' + delta + ', 当前=' + currentIndex + ', 新=' + newIndex);
        if (newIndex >= 0 && newIndex < currentData.length) {
            currentIndex = newIndex;
            scrollY = 0;
            console.log('[navigateToChapter] 调用stopCurrentPlayback');
            stopCurrentPlayback();  // 只停止播放，不清除会话策略
            render();
        }
    }

    function navigatePrev() {
        navigateToChapter(-1);
    }

    function navigateNext() {
        navigateToChapter(1);
    }

    // ============ 语音朗读 ============
    // Android TTS 回调
    window.onTTSStart = function() {
        console.log('[onTTSStart] 播放开始');
        isSpeaking = true;
        // 启动自动停止定时器
        startAutoStopTimer();
        render();
    };
    
    window.onTTSEnd = function() {
        console.log('[onTTSEnd] 收到TTS结束回调, expectingTTSEnd=' + expectingTTSEnd);
        // 只有正常播放结束才处理，手动暂停/停止时忽略
        if (!expectingTTSEnd) {
            console.log('[onTTSEnd] 忽略（非正常结束）');
            return;
        }
        isSpeaking = false;
        // TTS片段完成，播放下一个内容
        console.log('[onTTSEnd] 调用onContentFinished');
        onContentFinished();
    };
    
    window.onTTSError = function() {
        console.log('[onTTSError] TTS错误');
        isSpeaking = false;
        render();
    };
    
    // 启动自动停止定时器
    function startAutoStopTimer() {
        // 清除之前的定时器
        if (autoStopTimer) {
            clearTimeout(autoStopTimer);
            autoStopTimer = null;
        }
        if (countdownTimer) {
            clearInterval(countdownTimer);
            countdownTimer = null;
        }
        
        if (settings.autoStop > 0 && autoStopEndTime === 0) {
            // 设置结束时间
            autoStopEndTime = Date.now() + settings.autoStop * 60 * 1000;
            
            // 设置自动停止
            autoStopTimer = setTimeout(() => {
                console.log('自动停止播放');
                stopSpeech();
                autoStopEndTime = 0;
                if (countdownTimer) {
                    clearInterval(countdownTimer);
                    countdownTimer = null;
                }
                render();
            }, settings.autoStop * 60 * 1000);
            
            // 启动倒计时更新（每秒更新一次）
            countdownTimer = setInterval(() => {
                if (currentState === AppState.SETTINGS) {
                    render();
                }
            }, 1000);
        }
    }
    
    // 获取剩余倒计时（秒）
    function getCountdownSeconds() {
        if (autoStopEndTime === 0) return 0;
        const remaining = Math.max(0, autoStopEndTime - Date.now());
        return Math.ceil(remaining / 1000);
    }
    
    // 格式化倒计时显示
    function formatCountdown(seconds) {
        if (seconds <= 0) return '';
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    }
    
    // 立即启动自动停止定时器（从设置页面调用）
    function startAutoStopTimerNow(minutes) {
        // 清除之前的定时器
        clearAutoStopTimer();
        
        // 设置结束时间
        autoStopEndTime = Date.now() + minutes * 60 * 1000;
        
        // 设置自动停止
        autoStopTimer = setTimeout(() => {
            console.log('定时停止：时间到');
            stopSpeech();
            autoStopEndTime = 0;
            settings.autoStop = 0;  // 重置设置
            if (countdownTimer) {
                clearInterval(countdownTimer);
                countdownTimer = null;
            }
            render();
        }, minutes * 60 * 1000);
        
        // 启动倒计时更新（每秒更新一次）
        countdownTimer = setInterval(() => {
            render();  // 始终更新，不管在哪个页面
        }, 1000);
    }
    
    // 清除自动停止定时器
    function clearAutoStopTimer() {
        if (autoStopTimer) {
            clearTimeout(autoStopTimer);
            autoStopTimer = null;
        }
        if (countdownTimer) {
            clearInterval(countdownTimer);
            countdownTimer = null;
        }
        autoStopEndTime = 0;
    }
    
    // 根据播放模式处理下一步
    function handlePlayModeNext() {
        console.log('[handlePlayModeNext] 播放模式=' + settings.playMode + ', 当前章节=' + currentIndex + ', 策略=' + settings.playStrategy);
        
        // 先清除之前的自动播放定时器
        if (autoPlayTimeout) {
            clearTimeout(autoPlayTimeout);
            autoPlayTimeout = null;
        }
        
        switch (settings.playMode) {
            case 'single':
                // 单次播放：播放完成后停止
                render();
                break;
                
            case 'chapterLoop':
                // 单章循环：重复播放当前章节
                console.log('[handlePlayModeNext] chapterLoop: 重复章节' + currentIndex);
                autoPlayTimeout = setTimeout(() => {
                    autoPlayTimeout = null;
                    console.log('[handlePlayModeNext] chapterLoop: 开始播放章节' + currentIndex);
                    if (!isSpeaking) {
                        startSpeech();
                    }
                }, 500);
                break;
                
            case 'allOnce':
                // 全章一次：自动切换到下一章
                if (currentIndex < currentData.length - 1) {
                    currentIndex++;
                    console.log('[handlePlayModeNext] allOnce: 切换到章节' + currentIndex);
                    scrollY = 0;
                    render();
                    autoPlayTimeout = setTimeout(() => {
                        autoPlayTimeout = null;
                        console.log('[handlePlayModeNext] allOnce: 开始播放章节' + currentIndex);
                        startSpeech();
                    }, 500);
                } else {
                    // 已到最后一章，停止
                    console.log('[handlePlayModeNext] allOnce: 已到最后一章');
                    render();
                }
                break;
                
            case 'allLoop':
                // 全章循环：自动切换到下一章，最后一章后回到第一章
                if (currentIndex < currentData.length - 1) {
                    currentIndex++;
                } else {
                    currentIndex = 0;  // 回到第一章
                }
                console.log('[handlePlayModeNext] allLoop: 切换到章节' + currentIndex);
                scrollY = 0;
                render();
                autoPlayTimeout = setTimeout(() => {
                    autoPlayTimeout = null;
                    console.log('[handlePlayModeNext] allLoop: 开始播放章节' + currentIndex);
                    startSpeech();
                }, 500);
                break;
        }
    }

    // 只停止当前播放（用于切换章节等）
    function stopCurrentPlayback() {
        console.log('[stopCurrentPlayback] 开始');
        // 标记为非正常结束，忽略后续回调
        expectingTTSEnd = false;
        
        // 取消待处理的自动播放
        if (autoPlayTimeout) {
            clearTimeout(autoPlayTimeout);
            autoPlayTimeout = null;
        }
        
        // 停止音频播放
        if (audioPlayer) {
            audioPlayer.pause();
            audioPlayer = null;
        }
        audioQueue = [];
        audioIndex = 0;
        
        // 清除内容队列
        contentQueue = [];
        contentIndex = 0;
        playedContentTypes = [];
        
        // 停止 TTS
        if (typeof AndroidTTS !== 'undefined') {
            AndroidTTS.stop();
        }
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
        }
        
        isSpeaking = false;
        isPaused = false;
        console.log('[stopCurrentPlayback] 完成');
    }

    function toggleSpeech() {
        console.log('[toggleSpeech] isSpeaking=' + isSpeaking + ', isPaused=' + isPaused + ', lastPlayStrategy=' + lastPlayStrategy);
        if (isSpeaking) {
            console.log('[toggleSpeech] 调用pauseSpeech');
            pauseSpeech();
        } else if (isPaused && lastPlayStrategy) {
            // 暂停后继续，使用之前的策略
            console.log('[toggleSpeech] 调用resumeSpeech');
            resumeSpeech();
        } else {
            // 每次新播放都使用当前设置的策略
            console.log('[toggleSpeech] 调用startSpeech');
            startSpeech();
        }
        render();
    }
    
    function pauseSpeech() {
        console.log('[pauseSpeech] 暂停');
        // 标记为非正常结束，忽略后续的 onTTSEnd 回调
        expectingTTSEnd = false;
        
        if (audioPlayer) {
            audioPlayer.pause();
            audioPlayer = null;  // 清除，恢复时用新策略
        }
        if (typeof AndroidTTS !== 'undefined') {
            AndroidTTS.stop();
        }
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
        }
        isSpeaking = false;
        isPaused = true;
        // 注意：保留 contentQueue 和 contentIndex，恢复时继续
    }
    
    function resumeSpeech() {
        console.log('[resumeSpeech] 恢复播放');
        isPaused = false;
        expectingTTSEnd = true;
        
        // 恢复时使用新策略从当前内容继续
        if (contentQueue.length > 0 && contentIndex < contentQueue.length) {
            console.log('[resumeSpeech] 从内容队列恢复:', contentQueue[contentIndex]);
            playNextContent();
        } else {
            // 队列为空，重新开始
            console.log('[resumeSpeech] 队列为空，重新开始');
            startSpeech();
        }
    }

    // 音频播放器
    let audioPlayer = null;
    let audioQueue = [];   // 待播放的音频队列
    let audioIndex = 0;    // 当前播放索引
    const audioExistsCache = {};  // 音频文件存在性缓存
    
    // 片段级播放控制
    let contentQueue = [];     // 待播放的内容类型队列 ['正文', '解释', '关键词', '故事']
    let contentIndex = 0;      // 当前播放到第几个内容片段
    let playedContentTypes = [];  // 本章已播放过的内容类型
    
    // 获取音频文件路径
    function getAudioPath(type, index, name, contentType) {
        const prefix = type === 'study' ? 'sanzi' : 'poem';
        const num = String(index + 1).padStart(2, '0');
        // 从标题中提取名字（去掉"第X章 "前缀）
        const cleanName = name.replace(/^第[一二三四五六七八九十]+章\s*/, '');
        return `js/data/audio/${prefix}_${num}_${cleanName}_${contentType}.mp3`;
    }
    
    // 检查音频文件是否存在（使用缓存）
    function checkAudioExists(path) {
        // 使用缓存避免重复检查
        if (path in audioExistsCache) {
            return Promise.resolve(audioExistsCache[path]);
        }
        
        return new Promise((resolve) => {
            let resolved = false;  // 防止重复解析
            const audio = new Audio(path);
            
            const onSuccess = () => {
                if (resolved) return;
                resolved = true;
                audioExistsCache[path] = true;
                // 移除监听器后再释放资源，避免触发 error
                audio.removeEventListener('error', onError);
                audio.src = '';
                resolve(true);
            };
            
            const onError = () => {
                if (resolved) return;
                resolved = true;
                audioExistsCache[path] = false;
                audio.removeEventListener('canplaythrough', onSuccess);
                resolve(false);
            };
            
            audio.addEventListener('canplaythrough', onSuccess, { once: true });
            audio.addEventListener('error', onError, { once: true });
            audio.load();
        });
    }
    
    // 播放单个音频文件（用于片段级播放）
    function playSingleAudio(audioPath) {
        console.log('[playSingleAudio] 播放:', audioPath);
        
        audioPlayer = new Audio(audioPath);
        audioPlayer.volume = 1.0;
        audioPlayer.addEventListener('ended', () => {
            console.log('[playSingleAudio] 播放完成');
            isSpeaking = false;
            audioPlayer = null;
            // 片段完成，播放下一个内容
            onContentFinished();
        });
        audioPlayer.addEventListener('error', (e) => {
            console.error('[playSingleAudio] 播放错误:', e);
            isSpeaking = false;
            audioPlayer = null;
            onContentFinished();
        });
        audioPlayer.play().catch(e => {
            console.error('[playSingleAudio] 播放失败:', e);
            isSpeaking = false;
            audioPlayer = null;
            onContentFinished();
        });
    }
    
    // 当前内容片段播放完成
    function onContentFinished() {
        console.log('[onContentFinished] 片段完成, contentIndex=' + contentIndex + ', 队列长度=' + contentQueue.length);
        
        if (!expectingTTSEnd) {
            console.log('[onContentFinished] 非正常结束，忽略');
            return;
        }
        
        // 记录刚播放完的内容类型
        if (contentIndex >= 0 && contentIndex < contentQueue.length) {
            const justPlayed = contentQueue[contentIndex];
            if (!playedContentTypes.includes(justPlayed)) {
                playedContentTypes.push(justPlayed);
            }
        }
        
        contentIndex++;
        
        // 重新获取当前启用的内容类型
        const enabledTypes = getEnabledContentTypes();
        
        // 构建新的待播放队列
        const remaining = [];
        
        // 1. 原队列中剩余且仍启用的内容（未播放过）
        for (let i = contentIndex; i < contentQueue.length; i++) {
            const type = contentQueue[i];
            if (enabledTypes.includes(type) && !playedContentTypes.includes(type)) {
                remaining.push(type);
            }
        }
        
        // 2. 新启用的内容（不在原队列中，也没播放过）
        for (const type of enabledTypes) {
            if (!contentQueue.includes(type) && !playedContentTypes.includes(type)) {
                remaining.push(type);
            }
        }
        
        console.log('[onContentFinished] 已播放:', playedContentTypes, ', 剩余待播放:', remaining);
        
        if (remaining.length > 0) {
            // 更新队列，继续播放
            contentQueue = remaining;
            contentIndex = 0;
            setTimeout(() => playNextContent(), 300);
        } else {
            // 本章所有片段播放完成
            console.log('[onContentFinished] 本章播放完成');
            contentQueue = [];
            contentIndex = 0;
            playedContentTypes = [];  // 清除已播放记录
            handlePlayModeNext();
        }
    }
    
    // 获取当前设置启用的内容类型
    function getEnabledContentTypes() {
        const types = [];
        if (settings.playContent) types.push('正文');
        if (settings.playExplanation) types.push('解释');
        if (settings.playNotes) types.push('关键词');
        if (settings.playStories) types.push('故事');
        if (types.length === 0) types.push('正文');
        return types;
    }
    
    // 播放下一个内容片段（使用最新策略）
    async function playNextContent() {
        // 重新获取启用的内容类型（用户可能已修改设置）
        const enabledTypes = getEnabledContentTypes();
        
        // 找到下一个需要播放的内容
        while (contentIndex < contentQueue.length) {
            const currentType = contentQueue[contentIndex];
            // 检查这个类型是否仍然启用
            if (enabledTypes.includes(currentType)) {
                break;
            }
            console.log('[playNextContent] 跳过已禁用的内容:', currentType);
            contentIndex++;
        }
        
        if (contentIndex >= contentQueue.length) {
            console.log('[playNextContent] 没有更多内容');
            onContentFinished();
            return;
        }
        
        const currentType = contentQueue[contentIndex];
        const item = currentData[currentIndex];
        const type = currentState === AppState.STUDY ? 'study' : 'poem';
        const currentStrategy = settings.playStrategy;  // 使用最新策略
        
        console.log('[playNextContent] 播放:', currentType, ', 策略:', currentStrategy);
        
        if (currentStrategy === 'mp3') {
            // MP3策略
            const path = getAudioPath(type, currentIndex, item.title, currentType);
            const exists = await checkAudioExists(path);
            
            if (exists) {
                console.log('[playNextContent] 使用MP3:', path);
                isSpeaking = true;
                isPaused = false;
                lastPlayStrategy = 'mp3';
                if (window.onTTSStart) window.onTTSStart();
                render();
                playSingleAudio(path);
                return;
            }
            console.log('[playNextContent] MP3不存在，降级到TTS');
        }
        
        // TTS策略
        const text = buildContentText(item, currentType);
        if (!text) {
            console.log('[playNextContent] 内容为空，跳过');
            contentIndex++;
            playNextContent();
            return;
        }
        
        console.log('[playNextContent] 使用TTS播放:', currentType);
        speakText(text);
    }
    
    // 构建单个内容类型的文本
    function buildContentText(item, contentType) {
        switch (contentType) {
            case '正文':
                let text = item.title + '。';
                if (item.author) {
                    text += item.dynasty + '，' + item.author + '。';
                }
                if (item.pinyin) {
                    text += item.pinyin;
                } else {
                    text += item.content.replace(/\n\n/g, '。').replace(/\n/g, '，');
                }
                return text;
            case '解释':
                return item.explanation ? '解释：' + item.explanation : '';
            case '关键词':
                return item.notes ? '注释：' + item.notes : '';
            case '故事':
                if (!item.stories || item.stories.length === 0) return '';
                let storyText = '故事：';
                item.stories.forEach((story, idx) => {
                    storyText += story.title + '。' + story.content;
                    if (idx < item.stories.length - 1) storyText += '。';
                });
                return storyText;
            default:
                return '';
        }
    }
    
    // TTS朗读文本
    function speakText(text) {
        if (typeof AndroidTTS !== 'undefined') {
            console.log('[speakText] 使用AndroidTTS');
            try {
                AndroidTTS.speak(text);
                isSpeaking = true;
                isPaused = false;
                lastPlayStrategy = 'tts';
                if (window.onTTSStart) window.onTTSStart();
                render();
            } catch (e) {
                console.error('AndroidTTS 错误:', e);
                onContentFinished();
            }
        } else if ('speechSynthesis' in window) {
            console.log('[speakText] 使用Web Speech API');
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'zh-CN';
            utterance.rate = 0.8;
            utterance.onend = () => {
                isSpeaking = false;
                onContentFinished();
            };
            utterance.onerror = () => {
                isSpeaking = false;
                onContentFinished();
            };
            speechSynthesis.speak(utterance);
            isSpeaking = true;
            isPaused = false;
            lastPlayStrategy = 'tts';
            render();
        } else {
            console.log('[speakText] 语音不可用');
            onContentFinished();
        }
    }
    
    async function startSpeech() {
        console.log('[startSpeech] 开始, 设置策略=' + settings.playStrategy);
        stopCurrentPlayback();
        
        const item = currentData[currentIndex];
        console.log('[startSpeech] 章节:', item.title);
        
        // 初始化内容队列
        contentQueue = getEnabledContentTypes();
        contentIndex = 0;
        playedContentTypes = [];  // 新章节清除已播放记录
        expectingTTSEnd = true;
        
        console.log('[startSpeech] 内容队列:', contentQueue.join(', '));
        
        // 开始播放第一个内容片段
        playNextContent();
    }

    // 完全停止播放并清除所有策略状态（用于手动停止、返回等）
    function stopSpeech() {
        stopCurrentPlayback();
        // 清除策略状态
        lastPlayStrategy = '';
        
        // 注意：停止播放不清除定时停止倒计时
        // 倒计时只有时间到了、手动关闭或重启才会停止
    }
    
    // 如果正在播放则重新开始（用于设置改变时）
    function restartIfPlaying() {
        if (isSpeaking || isPaused) {
            restartPlayback();
        }
    }
    
    // 重新开始播放（用于设置改变后立即生效）
    function restartPlayback() {
        console.log('[restartPlayback] 重新开始播放');
        stopCurrentPlayback();
        startSpeech();
    }

    // ============ 游戏循环 ============
    function gameLoop() {
        // 惯性滚动
        if (Math.abs(velocity) > 0.1 && !isScrolling) {
            // 根据滑动速度增强惯性效果
            const boostFactor = Math.min(2.5, 1 + Math.abs(velocity) / 30); // 最大增强2.5倍
            scrollY = Math.max(0, Math.min(maxScrollY, scrollY + velocity * boostFactor));
            velocity *= 0.85;  // 更慢的衰减，维持更久惯性
            render();
        }
        
        requestAnimationFrame(gameLoop);
    }

    // ============ 渲染函数 ============
    function render() {
        ctx.clearRect(0, 0, screenWidth, screenHeight);
        
        switch (currentState) {
            case AppState.MENU:
                renderMenu();
                break;
            case AppState.STUDY:
            case AppState.POEM:
                renderContent();
                break;
            case AppState.STUDY_LIST:
            case AppState.POEM_LIST:
                renderList();
                break;
            case AppState.SETTINGS:
                renderSettings();
                break;
        }
    }

    function renderMenu() {
        // 背景
        ctx.fillStyle = colors.background;
        ctx.fillRect(0, 0, screenWidth, screenHeight);
        
        // 装饰背景
        drawDecorativeBackground();
        
        // 标题
        ctx.fillStyle = colors.primary;
        ctx.font = 'bold 36px "PingFang SC", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('国学经典', screenWidth / 2, screenHeight * 0.2);
        
        ctx.font = '18px "PingFang SC", sans-serif';
        ctx.fillStyle = colors.textLight;
        ctx.fillText('传承中华文化 弘扬国学精神', screenWidth / 2, screenHeight * 0.27);
        
        // 按钮
        const btnWidth = screenWidth * 0.7;
        const btnHeight = 60;
        const centerX = screenWidth / 2;
        
        // 三字经按钮
        drawButton(centerX - btnWidth/2, screenHeight * 0.4, btnWidth, btnHeight, '📖 三字经', colors.primary);
        
        // 古诗词按钮
        drawButton(centerX - btnWidth/2, screenHeight * 0.55, btnWidth, btnHeight, '🎋 古诗词', colors.highlight);
        
        // 底部说明
        ctx.font = '14px "PingFang SC", sans-serif';
        ctx.fillStyle = colors.textLight;
        ctx.textAlign = 'center';
        ctx.fillText('点击选择学习内容', screenWidth / 2, screenHeight * 0.85);
    }

    function renderContent() {
        const item = currentData[currentIndex];
        const headerHeight = 50;
        const footerHeight = 60;
        const padding = 20;
        const contentWidth = screenWidth - padding * 2;
        
        // 背景
        ctx.fillStyle = colors.background;
        ctx.fillRect(0, 0, screenWidth, screenHeight);
        
        // 计算内容高度
        let contentHeight = calculateContentHeight(item, contentWidth, padding);
        maxScrollY = Math.max(0, contentHeight - (screenHeight - headerHeight - footerHeight));
        
        // 内容区域裁剪
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, headerHeight, screenWidth, screenHeight - headerHeight - footerHeight);
        ctx.clip();
        
        // 绘制内容
        let y = headerHeight + padding - scrollY;
        
        // 标题
        ctx.fillStyle = colors.title;
        ctx.font = 'bold 28px "PingFang SC", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(item.title, screenWidth / 2, y + 30);
        y += 50;
        
        // 作者（如果有）
        if (item.author) {
            ctx.font = '16px "PingFang SC", sans-serif';
            ctx.fillStyle = colors.textLight;
            ctx.fillText(`【${item.dynasty}】${item.author}`, screenWidth / 2, y + 20);
            y += 40;
        }
        
        // 原文（大字显示）+ 解读（小字紧跟）
        y += 20;
        
        // 判断内容格式：如果包含换行符按换行分割，否则按句号分割
        let contentLines;
        let isStudyContent = !item.content.includes('\n');
        
        if (item.content.includes('\n')) {
            // 古诗词格式：按换行分割
            contentLines = item.content.split('\n').filter(l => l.trim());
        } else {
            // 三字经格式：按句号分割（保留每个短句）
            contentLines = item.content.split(/[。，]/).filter(l => l.trim());
        }
        
        const expLines = item.explanation ? item.explanation.split(/[。；]/).filter(l => l.trim()) : [];
        
        // 三字经：4句一组（12字），古诗词：2句一组
        const groupSize = isStudyContent ? 4 : 2;
        
        // 先显示所有原文
        for (let i = 0; i < contentLines.length; i += groupSize) {
            // 合并句子为一行
            let combinedLine = '';
            
            if (isStudyContent) {
                // 三字经格式：4句一行（12字）
                for (let j = 0; j < groupSize && i + j < contentLines.length; j++) {
                    const sentence = contentLines[i + j].trim();
                    if (j > 0 && j % 2 === 0) {
                        combinedLine += ' ';  // 每两句之间加空格
                    }
                    combinedLine += sentence;
                    if (j % 2 === 0) {
                        combinedLine += '，';
                    } else {
                        combinedLine += '。';
                    }
                }
            } else {
                // 古诗词格式：2句一行
                combinedLine = contentLines[i].trim();
                if (i + 1 < contentLines.length) {
                    combinedLine += '  ' + contentLines[i + 1].trim();
                }
            }
            
            // 原文大字
            ctx.fillStyle = colors.content;
            ctx.font = 'bold 22px "PingFang SC", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(combinedLine, screenWidth / 2, y + 28);
            y += 42;
        }
        
        // 再整体显示解读（根据设置决定是否显示）
        if (settings.showExplanation && item.explanation) {
            y += 15;
            ctx.fillStyle = colors.explanation;
            ctx.font = '14px "PingFang SC", sans-serif';
            ctx.textAlign = 'left';
            
            const wrappedExp = wrapText(item.explanation, contentWidth - 20);
            wrappedExp.forEach(line => {
                ctx.fillText(line, padding + 10, y + 16);
                y += 22;
            });
        }
        
        // 注释（小字，最下面，根据设置决定是否显示）
        if (settings.showNotes && item.notes) {
            y += 30;
            
            // 分隔线
            ctx.strokeStyle = colors.border;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(screenWidth - padding, y);
            ctx.stroke();
            
            y += 15;
            ctx.fillStyle = '#888';
            ctx.font = '13px "PingFang SC", sans-serif';
            ctx.textAlign = 'left';
            
            const notesLines = wrapText(item.notes, contentWidth - 20);
            notesLines.forEach(line => {
                ctx.fillText(line, padding + 10, y + 16);
                y += 22;
            });
        }
        
        // 故事（根据设置决定是否显示）
        if (settings.showStories && item.stories && item.stories.length > 0) {
            y += 30;
            
            // 分隔线
            ctx.strokeStyle = colors.primary;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(screenWidth - padding, y);
            ctx.stroke();
            
            y += 20;
            
            // 故事标题
            ctx.fillStyle = colors.primary;
            ctx.font = 'bold 16px "PingFang SC", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('📖 故事', screenWidth / 2, y + 10);
            y += 30;
            
            // 显示每个故事
            item.stories.forEach((story, idx) => {
                // 故事小标题
                ctx.fillStyle = colors.title;
                ctx.font = 'bold 15px "PingFang SC", sans-serif';
                ctx.textAlign = 'left';
                ctx.fillText('【' + story.title + '】', padding + 10, y + 16);
                y += 28;
                
                // 故事内容
                ctx.fillStyle = colors.text;
                ctx.font = '14px "PingFang SC", sans-serif';
                
                const storyLines = wrapText(story.content.replace(/\n\n/g, '\n'), contentWidth - 20);
                storyLines.forEach(line => {
                    ctx.fillText(line, padding + 10, y + 16);
                    y += 22;
                });
                
                y += 20; // 故事之间间距
            });
        }
        
        ctx.restore();
        
        // 顶部导航栏
        drawHeader(item.title);
        
        // 底部操作栏
        drawFooter();
    }

    function renderList() {
        const headerHeight = 50;
        const tabHeight = 45;
        const padding = 15;
        const itemHeight = 70;
        
        // 背景
        ctx.fillStyle = colors.background;
        ctx.fillRect(0, 0, screenWidth, screenHeight);
        
        // 绘制顶部标题
        ctx.fillStyle = colors.primary;
        ctx.fillRect(0, 0, screenWidth, headerHeight);
        ctx.fillStyle = colors.white;
        ctx.font = 'bold 18px "PingFang SC", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('目录', screenWidth / 2, 32);
        
        // 绘制返回按钮
        ctx.font = '24px "PingFang SC", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('‹', 15, 32);
        
        // 绘制Tab切换
        const tabY = headerHeight;
        ctx.fillStyle = colors.white;
        ctx.fillRect(0, tabY, screenWidth, tabHeight);
        
        const isStudy = currentState === AppState.STUDY_LIST;
        const tabWidth = screenWidth / 2;
        
        // 三字经Tab
        ctx.fillStyle = isStudy ? colors.primary : colors.textLight;
        ctx.font = isStudy ? 'bold 16px "PingFang SC", sans-serif' : '16px "PingFang SC", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('三字经', tabWidth * 0.5, tabY + 28);
        
        // 古诗词Tab
        ctx.fillStyle = !isStudy ? colors.primary : colors.textLight;
        ctx.font = !isStudy ? 'bold 16px "PingFang SC", sans-serif' : '16px "PingFang SC", sans-serif';
        ctx.fillText('古诗词', tabWidth * 1.5, tabY + 28);
        
        // 下划线指示器
        ctx.fillStyle = colors.primary;
        const indicatorX = isStudy ? tabWidth * 0.5 - 30 : tabWidth * 1.5 - 30;
        ctx.fillRect(indicatorX, tabY + tabHeight - 3, 60, 3);
        
        // 分隔线
        ctx.strokeStyle = colors.border;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, tabY + tabHeight);
        ctx.lineTo(screenWidth, tabY + tabHeight);
        ctx.stroke();
        
        // 计算滚动范围
        const listStartY = headerHeight + tabHeight;
        const listHeight = currentData.length * itemHeight + padding * 2;
        maxScrollY = Math.max(0, listHeight - (screenHeight - listStartY));
        
        // 内容区域裁剪
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, headerHeight, screenWidth, screenHeight - headerHeight);
        ctx.clip();
        
        // 绘制列表项
        let y = listStartY + padding - scrollY;
        
        currentData.forEach((item, index) => {
            if (y + itemHeight > listStartY && y < screenHeight) {
                drawListItem(padding, y, screenWidth - padding * 2, itemHeight - 10, item, index);
            }
            y += itemHeight;
        });
        
        ctx.restore();
        
        // 顶部导航栏
        const title = currentState === AppState.STUDY_LIST ? '三字经目录' : '古诗词目录';
        drawHeader(title, false);
    }

    // ============ 绘制辅助函数 ============
    function drawDecorativeBackground() {
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = colors.primary;
        
        // 绘制装饰圆形
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * screenWidth;
            const y = Math.random() * screenHeight;
            const r = 20 + Math.random() * 40;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.globalAlpha = 1;
    }

    function drawButton(x, y, width, height, text, color) {
        // 阴影
        ctx.fillStyle = colors.shadow;
        ctx.beginPath();
        ctx.roundRect(x + 3, y + 3, width, height, 12);
        ctx.fill();
        
        // 按钮背景
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 12);
        ctx.fill();
        
        // 按钮文字
        ctx.fillStyle = colors.white;
        ctx.font = 'bold 20px "PingFang SC", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x + width / 2, y + height / 2);
    }

    function drawHeader(title, showMenu = true) {
        // 不再绘制顶部标题栏
    }

    function drawFooter() {
        const footerY = screenHeight - 80;
        const footerHeight = 80;
        
        // 背景
        ctx.fillStyle = colors.white;
        ctx.fillRect(0, footerY, screenWidth, footerHeight);
        
        // 分隔线
        ctx.strokeStyle = colors.border;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, footerY);
        ctx.lineTo(screenWidth, footerY);
        ctx.stroke();
        
        // 布局：目录、设置、进度、播放
        const iconY = footerY + 48;
        const btnWidth = screenWidth / 4;
        
        ctx.textAlign = 'center';
        ctx.font = '40px "PingFang SC", sans-serif';
        
        // 1. 目录
        ctx.fillStyle = colors.primary;
        ctx.fillText('📋', btnWidth * 0.5, iconY);
        
        // 2. 设置
        ctx.fillStyle = (settings.showExplanation || settings.showNotes) ? colors.highlight : colors.textLight;
        ctx.fillText('⚙️', btnWidth * 1.5, iconY);
        
        // 3. 进度
        ctx.font = '20px "PingFang SC", sans-serif';
        ctx.fillStyle = colors.textLight;
        ctx.fillText(`${currentIndex + 1} / ${currentData.length}`, btnWidth * 2.5, iconY);
        
        // 4. 播放/暂停
        // 如果有倒计时，在播放按钮上方显示
        const countdown = getCountdownSeconds();
        if (countdown > 0) {
            ctx.font = '12px "PingFang SC", sans-serif';
            ctx.fillStyle = colors.highlight;
            ctx.fillText(formatCountdown(countdown), btnWidth * 3.5, footerY + 15);
            // 有倒计时时播放按钮往下移
            ctx.font = '36px "PingFang SC", sans-serif';
            ctx.fillStyle = isSpeaking ? colors.highlight : colors.primary;
            ctx.fillText(isSpeaking ? '⏸️' : '▶️', btnWidth * 3.5, iconY + 8);
        } else {
            ctx.font = '40px "PingFang SC", sans-serif';
            ctx.fillStyle = isSpeaking ? colors.highlight : colors.primary;
            ctx.fillText(isSpeaking ? '⏸️' : '▶️', btnWidth * 3.5, iconY);
        }
    }

    function drawTextCard(x, y, width, text, label, color) {
        const padding = 15;
        const lineHeight = 28;
        const labelHeight = 30;
        
        // 计算文本行数
        ctx.font = '18px "PingFang SC", sans-serif';
        const lines = wrapText(text, width - padding * 2);
        const cardHeight = labelHeight + lines.length * lineHeight + padding * 2;
        
        // 卡片背景
        ctx.fillStyle = colors.white;
        ctx.beginPath();
        ctx.roundRect(x, y, width, cardHeight, 10);
        ctx.fill();
        
        // 卡片边框
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x, y, width, cardHeight, 10);
        ctx.stroke();
        
        // 标签
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(x, y, 60, labelHeight, [10, 0, 10, 0]);
        ctx.fill();
        
        ctx.fillStyle = colors.white;
        ctx.font = 'bold 14px "PingFang SC", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, x + 30, y + 20);
        
        // 文本内容
        ctx.fillStyle = colors.text;
        ctx.font = '18px "PingFang SC", sans-serif';
        ctx.textAlign = 'left';
        
        let textY = y + labelHeight + padding + 5;
        lines.forEach(line => {
            ctx.fillText(line, x + padding, textY);
            textY += lineHeight;
        });
        
        return cardHeight;
    }

    function drawListItem(x, y, width, height, item, index) {
        const isActive = index === currentIndex;
        
        // 背景
        ctx.fillStyle = isActive ? colors.secondary : colors.white;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 10);
        ctx.fill();
        
        // 边框
        ctx.strokeStyle = isActive ? colors.primary : colors.border;
        ctx.lineWidth = isActive ? 2 : 1;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 10);
        ctx.stroke();
        
        // 序号
        ctx.fillStyle = colors.white;
        ctx.beginPath();
        ctx.arc(x + 30, y + height / 2, 18, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? colors.primary : colors.highlight;
        ctx.fill();
        
        ctx.fillStyle = colors.white;
        ctx.font = 'bold 14px "PingFang SC", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(index + 1, x + 30, y + height / 2 + 5);
        
        // 标题
        ctx.fillStyle = isActive ? colors.white : colors.text;
        ctx.font = '18px "PingFang SC", sans-serif';
        ctx.textAlign = 'left';
        const title = item.title.length > 15 ? item.title.substring(0, 15) + '...' : item.title;
        ctx.fillText(title, x + 60, y + height / 2 + 6);
        
        // 箭头
        ctx.fillStyle = isActive ? colors.white : colors.textLight;
        ctx.font = '20px "PingFang SC", sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('›', x + width - 15, y + height / 2 + 6);
    }

    function calculateContentHeight(item, contentWidth, padding) {
        let height = 90; // 标题区域
        
        // 作者
        if (item.author) {
            height += 40;
        }
        
        height += 20; // 间距
        
        // 判断内容格式：如果包含换行符按换行分割，否则按句号分割
        let contentLines;
        if (item.content.includes('\n')) {
            contentLines = item.content.split('\n').filter(l => l.trim());
        } else {
            contentLines = item.content.split(/[。，]/).filter(l => l.trim());
        }
        
        const expLines = item.explanation ? item.explanation.split(/[。；]/).filter(l => l.trim()) : [];
        
        ctx.font = '14px "PingFang SC", sans-serif';
        
        // 三字经：4句一组，古诗词：2句一组
        const isStudyContent = !item.content.includes('\n');
        const groupSize = isStudyContent ? 4 : 2;
        
        // 计算原文行数
        for (let i = 0; i < contentLines.length; i += groupSize) {
            height += 42; // 原文行高
        }
        
        // 计算解读高度（根据设置决定是否计算）
        if (settings.showExplanation && item.explanation) {
            height += 15;
            const wrappedExp = wrapText(item.explanation, contentWidth - 20);
            height += wrappedExp.length * 22;
        }
        
        // 注释（根据设置决定是否计算）
        if (settings.showNotes && item.notes) {
            height += 45; // 分隔线和间距
            ctx.font = '13px "PingFang SC", sans-serif';
            const notesLines = wrapText(item.notes, contentWidth - 20);
            height += notesLines.length * 22;
        }
        
        // 故事（根据设置决定是否计算）
        if (settings.showStories && item.stories && item.stories.length > 0) {
            height += 50; // 分隔线和标题
            ctx.font = '14px "PingFang SC", sans-serif';
            
            item.stories.forEach(story => {
                height += 28; // 故事小标题
                const storyLines = wrapText(story.content.replace(/\n\n/g, '\n'), contentWidth - 20);
                height += storyLines.length * 22;
                height += 20; // 故事之间间距
            });
        }
        
        height += 20; // 底部间距
        
        return height;
    }

    function wrapText(text, maxWidth) {
        const lines = [];
        const paragraphs = text.split('\n');
        
        paragraphs.forEach(paragraph => {
            if (paragraph === '') {
                lines.push('');
                return;
            }
            
            let currentLine = '';
            
            for (let i = 0; i < paragraph.length; i++) {
                const char = paragraph[i];
                const testLine = currentLine + char;
                const metrics = ctx.measureText(testLine);
                
                if (metrics.width > maxWidth && currentLine !== '') {
                    lines.push(currentLine);
                    currentLine = char;
                } else {
                    currentLine = testLine;
                }
            }
            
            if (currentLine !== '') {
                lines.push(currentLine);
            }
        });
        
        return lines;
    }

    // ============ 设置页面 ============
    function renderSettings() {
        const headerHeight = 45;
        const padding = 12;
        
        // 背景
        ctx.fillStyle = colors.background;
        ctx.fillRect(0, 0, screenWidth, screenHeight);
        
        // 顶部标题栏
        ctx.fillStyle = colors.primary;
        ctx.fillRect(0, 0, screenWidth, headerHeight);
        ctx.fillStyle = colors.white;
        ctx.font = 'bold 16px "PingFang SC", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('设置', screenWidth / 2, 28);
        
        // 返回按钮
        ctx.font = '22px "PingFang SC", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('‹', 12, 28);
        
        let y = headerHeight + padding - scrollY;
        const itemHeight = 42;
        const sectionGap = 12;
        
        // ===== 显示设置 =====
        ctx.fillStyle = colors.textLight;
        ctx.font = '12px "PingFang SC", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('显示设置', padding, y + 12);
        y += 20;
        
        drawSettingSwitch(padding, y, '句子解释', settings.showExplanation);
        y += itemHeight;
        drawSettingSwitch(padding, y, '关键字注释', settings.showNotes);
        y += itemHeight;
        drawSettingSwitch(padding, y, '故事', settings.showStories);
        y += itemHeight + sectionGap;
        
        // ===== 播放策略 =====
        ctx.fillStyle = colors.textLight;
        ctx.font = '12px "PingFang SC", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('播放策略', padding, y + 12);
        y += 20;
        
        // 播放策略横向排列
        const strategyWidth = (screenWidth - padding * 2) / 2;
        drawModeButton(padding, y, strategyWidth - 4, 36, '本地音频(男声)', settings.playStrategy === 'mp3');
        drawModeButton(padding + strategyWidth, y, strategyWidth - 4, 36, '实时生成(女声)', settings.playStrategy === 'tts');
        y += 40 + sectionGap;
        
        // ===== 播放内容 =====
        ctx.fillStyle = colors.textLight;
        ctx.font = '12px "PingFang SC", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('播放内容', padding, y + 12);
        y += 20;
        
        drawSettingSwitch(padding, y, '正文', settings.playContent);
        y += itemHeight;
        drawSettingSwitch(padding, y, '解释', settings.playExplanation);
        y += itemHeight;
        drawSettingSwitch(padding, y, '注解', settings.playNotes);
        y += itemHeight;
        drawSettingSwitch(padding, y, '故事', settings.playStories);
        y += itemHeight + sectionGap;
        
        // ===== 播放模式 =====
        ctx.fillStyle = colors.textLight;
        ctx.font = '12px "PingFang SC", sans-serif';
        ctx.fillText('播放模式', padding, y + 12);
        y += 20;
        
        // 播放模式横向排列
        const modeWidth = (screenWidth - padding * 2) / 2;
        const modes = [
            { key: 'single', label: '单次' },
            { key: 'chapterLoop', label: '单章循环' },
            { key: 'allOnce', label: '全章一次' },
            { key: 'allLoop', label: '全章循环' }
        ];
        
        drawModeButton(padding, y, modeWidth - 4, 36, modes[0].label, settings.playMode === modes[0].key);
        drawModeButton(padding + modeWidth, y, modeWidth - 4, 36, modes[1].label, settings.playMode === modes[1].key);
        y += 40;
        drawModeButton(padding, y, modeWidth - 4, 36, modes[2].label, settings.playMode === modes[2].key);
        drawModeButton(padding + modeWidth, y, modeWidth - 4, 36, modes[3].label, settings.playMode === modes[3].key);
        y += 40 + sectionGap;
        
        // ===== 自动停止 =====
        ctx.fillStyle = colors.textLight;
        ctx.font = '12px "PingFang SC", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('定时停止', padding, y + 12);
        y += 20;
        
        // 定时停止横向排列（与播放模式对齐）
        const stopW = Math.floor((screenWidth - padding * 2 - 16) / 5);
        const stops = [0, 10, 20, 30, 60];
        const stopLabels = ['关', '10分', '20分', '30分', '1时'];
        stops.forEach((val, i) => {
            drawModeButton(padding + i * (stopW + 4), y, stopW, 36, stopLabels[i], settings.autoStop === val);
        });
        y += 40;
        
        // 显示倒计时（如果有）
        const countdown = getCountdownSeconds();
        if (countdown > 0) {
            y += 8;
            ctx.fillStyle = colors.highlight;
            ctx.font = 'bold 18px "PingFang SC", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('⏱ 剩余：' + formatCountdown(countdown), screenWidth / 2, y + 16);
            y += 30;
        }
        
        y += padding;
        
        // 更新滚动范围
        maxScrollY = Math.max(0, y + scrollY - screenHeight + padding);
    }
    
    function drawModeButton(x, y, width, height, label, isSelected) {
        ctx.fillStyle = isSelected ? colors.highlight : colors.white;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 6);
        ctx.fill();
        
        if (!isSelected) {
            ctx.strokeStyle = colors.border;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        
        ctx.fillStyle = isSelected ? colors.white : colors.text;
        ctx.font = '14px "PingFang SC", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, x + width / 2, y + height / 2 + 5);
    }
    
    function drawSettingSwitch(x, y, label, isOn, key) {
        const width = screenWidth - x * 2;
        const height = 50;
        
        // 背景
        ctx.fillStyle = colors.white;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 10);
        ctx.fill();
        
        // 文字
        ctx.fillStyle = colors.text;
        ctx.font = '16px "PingFang SC", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(label, x + 15, y + height / 2 + 5);
        
        // 开关
        const switchW = 50;
        const switchH = 28;
        const switchX = x + width - switchW - 15;
        const switchY = y + (height - switchH) / 2;
        
        ctx.fillStyle = isOn ? colors.highlight : '#ccc';
        ctx.beginPath();
        ctx.roundRect(switchX, switchY, switchW, switchH, switchH / 2);
        ctx.fill();
        
        // 开关圆点
        const dotR = switchH / 2 - 3;
        const dotX = isOn ? switchX + switchW - dotR - 5 : switchX + dotR + 5;
        ctx.fillStyle = colors.white;
        ctx.beginPath();
        ctx.arc(dotX, switchY + switchH / 2, dotR, 0, Math.PI * 2);
        ctx.fill();
    }
    
    function drawSettingRadio(x, y, label, isSelected, key, value) {
        const width = screenWidth - x * 2;
        const height = 50;
        
        // 背景
        ctx.fillStyle = colors.white;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 10);
        ctx.fill();
        
        // 文字
        ctx.fillStyle = colors.text;
        ctx.font = '16px "PingFang SC", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(label, x + 15, y + height / 2 + 5);
        
        // 选中标记
        const checkX = x + width - 35;
        const checkY = y + height / 2;
        
        if (isSelected) {
            ctx.fillStyle = colors.highlight;
            ctx.font = '24px "PingFang SC", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('✓', checkX, checkY + 8);
        }
    }
    
    function handleSettingsClick(x, y) {
        const headerHeight = 45;
        const padding = 12;
        
        // 返回按钮
        if (x < 60 && y < headerHeight) {
            currentState = previousState;
            scrollY = 0;
            render();
            return;
        }
        
        const itemHeight = 42;
        const sectionGap = 12;
        const adjustedY = y + scrollY;
        
        let itemY = headerHeight + padding;
        
        // 显示设置标题
        itemY += 20;
        
        // 句子解释
        if (adjustedY > itemY && adjustedY < itemY + itemHeight) {
            settings.showExplanation = !settings.showExplanation;
            saveSettings();
            render();
            return;
        }
        itemY += itemHeight;
        
        // 关键字注释
        if (adjustedY > itemY && adjustedY < itemY + itemHeight) {
            settings.showNotes = !settings.showNotes;
            saveSettings();
            render();
            return;
        }
        itemY += itemHeight;
        
        // 故事
        if (adjustedY > itemY && adjustedY < itemY + itemHeight) {
            settings.showStories = !settings.showStories;
            saveSettings();
            render();
            return;
        }
        itemY += itemHeight + sectionGap;
        
        // 播放策略标题
        itemY += 20;
        
        // 播放策略按钮
        if (adjustedY > itemY && adjustedY < itemY + 36) {
            if (x < screenWidth / 2) {
                settings.playStrategy = 'mp3';
            } else {
                settings.playStrategy = 'tts';
            }
            saveSettings();
            // 策略改变不中断当前播放，当前片段完成后自动使用新策略
            console.log('[设置] 播放策略改为:', settings.playStrategy);
            render();
            return;
        }
        itemY += 40 + sectionGap;
        
        // 播放内容标题
        itemY += 20;
        
        // 正文
        if (adjustedY > itemY && adjustedY < itemY + itemHeight) {
            settings.playContent = !settings.playContent;
            saveSettings();
            // 内容设置改变不中断当前播放，当前片段完成后自动应用新设置
            console.log('[设置] 正文播放:', settings.playContent);
            render();
            return;
        }
        itemY += itemHeight;
        
        // 解释
        if (adjustedY > itemY && adjustedY < itemY + itemHeight) {
            settings.playExplanation = !settings.playExplanation;
            saveSettings();
            console.log('[设置] 解释播放:', settings.playExplanation);
            render();
            return;
        }
        itemY += itemHeight;
        
        // 注解
        if (adjustedY > itemY && adjustedY < itemY + itemHeight) {
            settings.playNotes = !settings.playNotes;
            saveSettings();
            console.log('[设置] 注解播放:', settings.playNotes);
            render();
            return;
        }
        itemY += itemHeight;
        
        // 故事
        if (adjustedY > itemY && adjustedY < itemY + itemHeight) {
            settings.playStories = !settings.playStories;
            saveSettings();
            console.log('[设置] 故事播放:', settings.playStories);
            render();
            return;
        }
        itemY += itemHeight + sectionGap;
        
        // 播放模式标题
        itemY += 20;
        
        // 播放模式 2x2 按钮
        const modeWidth = (screenWidth - padding * 2) / 2;
        const modes = ['single', 'chapterLoop', 'allOnce', 'allLoop'];
        
        // 第一行
        if (adjustedY > itemY && adjustedY < itemY + 36) {
            if (x < screenWidth / 2) {
                settings.playMode = modes[0];
            } else {
                settings.playMode = modes[1];
            }
            saveSettings();
            render();
            return;
        }
        itemY += 40;
        
        // 第二行
        if (adjustedY > itemY && adjustedY < itemY + 36) {
            if (x < screenWidth / 2) {
                settings.playMode = modes[2];
            } else {
                settings.playMode = modes[3];
            }
            saveSettings();
            render();
            return;
        }
        itemY += 40 + sectionGap;
        
        // 定时停止标题
        itemY += 20;
        
        // 定时停止 5个横向按钮
        if (adjustedY > itemY && adjustedY < itemY + 36) {
            const stopW = (screenWidth - padding * 2) / 5;
            const stops = [0, 10, 20, 30, 60];
            const btnIndex = Math.floor((x - padding) / stopW);
            if (btnIndex >= 0 && btnIndex < 5) {
                const newValue = stops[btnIndex];
                settings.autoStop = newValue;
                
                // 立即启动或清除定时器
                if (newValue > 0) {
                    startAutoStopTimerNow(newValue);
                } else {
                    // 选择"关"时，清除定时器
                    clearAutoStopTimer();
                }
                
                saveSettings();
                render();
            }
            return;
        }
    }

    // roundRect polyfill
    if (!ctx.roundRect) {
        CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
            if (typeof radius === 'number') {
                radius = [radius, radius, radius, radius];
            }
            const [tl, tr, br, bl] = radius;
            
            this.moveTo(x + tl, y);
            this.lineTo(x + width - tr, y);
            this.quadraticCurveTo(x + width, y, x + width, y + tr);
            this.lineTo(x + width, y + height - br);
            this.quadraticCurveTo(x + width, y + height, x + width - br, y + height);
            this.lineTo(x + bl, y + height);
            this.quadraticCurveTo(x, y + height, x, y + height - bl);
            this.lineTo(x, y + tl);
            this.quadraticCurveTo(x, y, x + tl, y);
            this.closePath();
        };
    }

    // Android 返回键处理
    window.handleAndroidBack = function() {
        switch (currentState) {
            case AppState.SETTINGS:
                // 设置页面 -> 返回之前的页面
                currentState = previousState;
                scrollY = 0;
                render();
                return true;
            case AppState.STUDY_LIST:
                // 目录页面 -> 返回内容页面
                currentState = AppState.STUDY;
                scrollY = 0;
                render();
                return true;
            case AppState.POEM_LIST:
                // 目录页面 -> 返回内容页面
                currentState = AppState.POEM;
                scrollY = 0;
                render();
                return true;
            case AppState.MENU:
                // 主菜单 -> 退出应用
                return false;
            case AppState.STUDY:
            case AppState.POEM:
                // 内容页面 -> 退出应用
                return false;
            default:
                return false;
        }
    };

    // 启动应用
    init();
})();