package com.guoxue.app;

import android.annotation.SuppressLint;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.view.KeyEvent;
import androidx.appcompat.app.AppCompatActivity;
import android.widget.Toast;
import android.content.Intent;
import android.provider.Settings;
import android.util.Log;
import java.util.Locale;
import java.util.List;

public class MainActivity extends AppCompatActivity {
    private static final String TAG = "GuoXueTTS";

    private WebView webView;
    private TextToSpeech tts;
    private boolean ttsReady = false;
    private int ttsRetryCount = 0;
    private String pendingText = null; // 等待朗读的文本
    private String[] speechQueue = null; // 分段朗读队列
    private int speechIndex = 0; // 当前朗读索引
    private android.os.Handler speechHandler = new android.os.Handler(android.os.Looper.getMainLooper());

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webView);

        // 配置 WebView
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
        webSettings.setMediaPlaybackRequiresUserGesture(false);
        
        // 支持缩放
        webSettings.setSupportZoom(false);
        webSettings.setBuiltInZoomControls(false);
        
        // 设置 WebView 客户端
        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient());

        // 添加 JavaScript 接口
        webView.addJavascriptInterface(new TTSInterface(), "AndroidTTS");

        // 加载本地 HTML 文件
        webView.loadUrl("file:///android_asset/index.html");
    }

    private void initTTS() {
        ttsRetryCount++;
        Log.d(TAG, "=== initTTS 开始 (尝试 " + ttsRetryCount + ") ===");
        Log.d(TAG, "Context: " + this.getClass().getName());
        Log.d(TAG, "初始化TTS(尝试" + ttsRetryCount + ")...");
        
        // 列出可用的 TTS 引擎
        try {
            TextToSpeech tempTts = new TextToSpeech(this, null);
            String defaultEngine = tempTts.getDefaultEngine();
            Log.d(TAG, "默认TTS引擎: " + defaultEngine);
            
            List<TextToSpeech.EngineInfo> engines = tempTts.getEngines();
            Log.d(TAG, "可用TTS引擎数量: " + engines.size());
            for (TextToSpeech.EngineInfo engine : engines) {
                Log.d(TAG, "  引擎: " + engine.name + " | label: " + engine.label);
            }
            tempTts.shutdown();
        } catch (Exception e) {
            Log.e(TAG, "获取引擎列表失败: " + e.getMessage());
        }
        
        // 直接使用系统默认引擎，在主线程初始化
        Log.d(TAG, "开始创建 TextToSpeech 对象...");
        tts = new TextToSpeech(this, status -> {
            Log.d(TAG, "TTS OnInitListener 回调, status=" + status + " (SUCCESS=0, ERROR=-1)");
            runOnUiThread(() -> {
                Log.d(TAG, "TTS回调: status=" + status);
                if (status == TextToSpeech.SUCCESS) {
                    Log.d(TAG, "TTS 初始化成功!");
                    setupTTS();
                } else {
                    Log.e(TAG, "TTS 初始化失败! status=" + status);
                    if (ttsRetryCount < 3) {
                        Log.d(TAG, "将在1.5秒后重试...");
                        webView.postDelayed(() -> initTTS(), 1500);
                    } else {
                        Log.e(TAG, "重试次数用尽，放弃初始化");
                        openTTSSettings();
                    }
                }
            });
        });
        Log.d(TAG, "TextToSpeech 对象创建完成，等待回调...");
    }
    
    private void setupTTS() {
        if (tts == null) return;
        
        // 使用系统默认语言
        Locale defaultLocale = Locale.getDefault();
        int result = tts.setLanguage(defaultLocale);
        
        if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
            Log.w(TAG, "语言不支持，使用默认设置");
        } else {
            Log.d(TAG, "语音引擎初始化成功");
        }
        
        tts.setSpeechRate(0.6f);
        tts.setPitch(1.0f);
        ttsReady = true;
        
        // 如果有待朗读文本，立即朗读
        if (pendingText != null && !pendingText.isEmpty()) {
            doSpeak(pendingText);
        }
    }
    
    private void doSpeak(String text) {
        if (tts != null && ttsReady) {
            tts.setSpeechRate(0.6f);
            tts.setPitch(1.0f);
            
            // 分段朗读：按句号、感叹号、问号分割
            speechQueue = text.split("(?<=[。！？])");
            speechIndex = 0;
            
            // 先设置监听器
            tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                @Override
                public void onStart(String utteranceId) {
                    if (utteranceId.equals("segment_0")) {
                        runOnUiThread(() -> webView.evaluateJavascript("window.onTTSStart && window.onTTSStart()", null));
                    }
                }
                
                @Override
                public void onDone(String utteranceId) {
                    speechIndex++;
                    // 每段之间停顿 300 毫秒
                    speechHandler.postDelayed(() -> speakNextSegment(), 300);
                }
                
                @Override
                public void onError(String utteranceId) {
                    Log.e(TAG, "朗读出错: " + utteranceId);
                    speechIndex++;
                    speechHandler.postDelayed(() -> speakNextSegment(), 200);
                }
            });
            
            Log.d(TAG, "开始分段朗读(" + speechQueue.length + "段)");
            speakNextSegment();
            pendingText = null;
        }
    }
    
    private void speakNextSegment() {
        if (speechQueue == null || speechIndex >= speechQueue.length) {
            // 朗读完成
            runOnUiThread(() -> webView.evaluateJavascript("window.onTTSEnd && window.onTTSEnd()", null));
            return;
        }
        
        String segment = speechQueue[speechIndex].trim();
        if (segment.isEmpty()) {
            speechIndex++;
            speakNextSegment();
            return;
        }
        
        Log.d(TAG, "朗读第 " + (speechIndex + 1) + "/" + speechQueue.length + " 段: " + segment);
        
        tts.speak(segment, TextToSpeech.QUEUE_FLUSH, null, "segment_" + speechIndex);
    }
    
    private void openTTSSettings() {
        try {
            Intent intent = new Intent();
            intent.setAction("com.android.settings.TTS_SETTINGS");
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(intent);
        } catch (Exception e) {
            try {
                // 备选方案：打开无障碍设置
                Intent intent = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(intent);
            } catch (Exception e2) {
                Log.e(TAG, "请手动进入 设置→更多设置→无障碍→语音合成");
            }
        }
    }

    // TTS JavaScript 接口
    public class TTSInterface {
        @JavascriptInterface
        public void speak(String text) {
            runOnUiThread(() -> {
                pendingText = text; // 保存待朗读文本
                
                if (tts != null && ttsReady) {
                    doSpeak(text);
                } else {
                    Log.d(TAG, "正在初始化语音引擎...");
                    initTTS();
                }
            });
        }

        @JavascriptInterface
        public void stop() {
            if (tts != null) {
                tts.stop();
            }
        }

        @JavascriptInterface
        public boolean isReady() {
            return ttsReady;
        }
        
        @JavascriptInterface
        public void showToast(String message) {
            runOnUiThread(() -> Toast.makeText(MainActivity.this, message, Toast.LENGTH_SHORT).show());
        }
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        // 处理返回键
        if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    protected void onDestroy() {
        if (tts != null) {
            tts.stop();
            tts.shutdown();
        }
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}