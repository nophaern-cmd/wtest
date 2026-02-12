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
        POEM_LIST: 'poemList'
    };

    let currentState = AppState.STUDY;
    let currentIndex = 0;
    let currentData = studyData;  // 默认三字经
    let scrollY = 0;
    let maxScrollY = 0;
    let isSpeaking = false;
    let touchStartY = 0;
    let touchStartX = 0;
    let lastTouchY = 0;
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
        velocity = 0;
        isScrolling = false;
    }

    function handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const deltaY = lastTouchY - touch.clientY;
        
        if (Math.abs(touch.clientY - touchStartY) > 10) {
            isScrolling = true;
        }
        
        if (isScrolling && maxScrollY > 0) {
            scrollY = Math.max(0, Math.min(maxScrollY, scrollY + deltaY));
            velocity = deltaY;
            render();
        }
        
        lastTouchY = touch.clientY;
    }

    function handleTouchEnd(e) {
        e.preventDefault();
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
        
        // 判断是点击还是滑动
        if (Math.abs(deltaX) < 20 && Math.abs(deltaY) < 20) {
            handleClick(touch.clientX, touch.clientY);
        } else if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
            // 左右滑动切换
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
        
        // 底部栏：目录(左)、进度(中)、播放(右)
        if (y > footerY) {
            if (x < 80) {
                // 目录按钮
                if (currentState === AppState.STUDY) {
                    currentState = AppState.STUDY_LIST;
                } else {
                    currentState = AppState.POEM_LIST;
                }
                scrollY = 0;
                render();
            } else if (x > screenWidth - 80) {
                // 播放按钮
                toggleSpeech();
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

    function navigatePrev() {
        if (currentIndex > 0) {
            currentIndex--;
            scrollY = 0;
            stopSpeech();
            render();
        }
    }

    function navigateNext() {
        if (currentIndex < currentData.length - 1) {
            currentIndex++;
            scrollY = 0;
            stopSpeech();
            render();
        }
    }

    // ============ 语音朗读 ============
    // Android TTS 回调
    window.onTTSStart = function() {
        isSpeaking = true;
        render();
    };
    
    window.onTTSEnd = function() {
        isSpeaking = false;
        render();
    };
    
    window.onTTSError = function() {
        isSpeaking = false;
        render();
    };

    function toggleSpeech() {
        if (isSpeaking) {
            stopSpeech();
        } else {
            startSpeech();
        }
        render();
    }

    function startSpeech() {
        stopSpeech();
        
        const item = currentData[currentIndex];
        let text = '';
        
        // 如果有拼音，优先使用拼音朗读（更准确）
        if (item.pinyin) {
            text = item.title + '。';
            if (item.author) {
                text += item.dynasty + '，' + item.author + '。';
            }
            // 使用拼音作为内容
            text += item.pinyin;
        } else {
            // 没有拼音则使用原文
            text = item.title + '。';
            if (item.author) {
                text += item.dynasty + '，' + item.author + '。';
            }
            let content = item.content
                .replace(/\n\n/g, '。')
                .replace(/\n/g, '，');
            text += content;
        }
        
        console.log('开始朗读:', text.substring(0, 50));
        
        // 优先使用 Android TTS
        if (typeof AndroidTTS !== 'undefined') {
            console.log('AndroidTTS 存在, isReady:', AndroidTTS.isReady());
            // 即使未完全准备好也尝试调用
            try {
                AndroidTTS.speak(text);
                isSpeaking = true;
                console.log('AndroidTTS.speak 已调用');
            } catch (e) {
                console.error('AndroidTTS 错误:', e);
            }
        } 
        // 降级到 Web Speech API（浏览器调试用）
        else if ('speechSynthesis' in window) {
            console.log('使用 Web Speech API');
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'zh-CN';
            utterance.rate = 0.8;
            utterance.pitch = 1;
            
            utterance.onend = () => {
                isSpeaking = false;
                render();
            };
            
            utterance.onerror = (e) => {
                console.error('Speech 错误:', e);
                isSpeaking = false;
                render();
            };
            
            speechSynthesis.speak(utterance);
            isSpeaking = true;
        } else {
            console.log('语音合成不可用');
            alert('语音功能暂不可用，请检查系统TTS设置');
        }
    }

    function stopSpeech() {
        // 停止 Android TTS
        if (typeof AndroidTTS !== 'undefined') {
            AndroidTTS.stop();
        }
        // 停止 Web Speech API
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
        }
        isSpeaking = false;
    }

    // ============ 游戏循环 ============
    function gameLoop() {
        // 惯性滚动
        if (Math.abs(velocity) > 0.5 && !isScrolling) {
            scrollY = Math.max(0, Math.min(maxScrollY, scrollY + velocity));
            velocity *= 0.95;
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
        
        // 再整体显示解读
        if (item.explanation) {
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
        
        // 注释（小字，最下面）
        if (item.notes) {
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
        
        // 布局：目录(左)、进度(中)、播放(右)
        const iconY = footerY + 48;
        
        ctx.textAlign = 'center';
        
        // 1. 目录（左边）
        ctx.font = '48px "PingFang SC", sans-serif';
        ctx.fillStyle = colors.primary;
        ctx.fillText('📋', 55, iconY);
        
        // 2. 进度（中间）
        ctx.font = '22px "PingFang SC", sans-serif';
        ctx.fillStyle = colors.textLight;
        ctx.fillText(`${currentIndex + 1} / ${currentData.length}`, screenWidth / 2, iconY);
        
        // 3. 播放/暂停（右边）
        ctx.font = '48px "PingFang SC", sans-serif';
        ctx.fillStyle = isSpeaking ? colors.highlight : colors.primary;
        ctx.fillText(isSpeaking ? '⏸️' : '▶️', screenWidth - 55, iconY);
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
        
        // 计算解读高度
        if (item.explanation) {
            height += 15;
            const wrappedExp = wrapText(item.explanation, contentWidth - 20);
            height += wrappedExp.length * 22;
        }
        
        // 注释
        if (item.notes) {
            height += 45; // 分隔线和间距
            ctx.font = '13px "PingFang SC", sans-serif';
            const notesLines = wrapText(item.notes, contentWidth - 20);
            height += notesLines.length * 22;
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

    // 启动应用
    init();
})();