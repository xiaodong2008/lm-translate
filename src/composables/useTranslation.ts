import { computed, ref, watch } from "vue";

import axios from "axios";
import { marked } from "marked";

export function useTranslation() {
  // Reactive state
  const lmStudioUrl = ref("http://localhost:1234");
  const sourceLang = ref("auto");
  const targetLang = ref("en");
  const sourceText = ref("");
  const translatedText = ref("");
  const enableMarkdown = ref(true); // Always enabled
  const enableStreaming = ref(true);
  const isTranslating = ref(false);
  const error = ref("");
  const layoutMode = ref<"flex" | "block">("flex"); // Layout toggle state
  const availableModels = ref<string[]>([]);
  const selectedModel = ref(""); // Currently selected model
  const isLoadingModels = ref(false);
  const enableAutoTranslate = ref(false); // Auto-translate toggle
  const debounceTimer = ref<number | null>(null);

  // Computed property for markdown rendering (translation only)
  const translatedMarkdownHtml = computed(() => {
    if (!translatedText.value) return "";
    try {
      return marked(translatedText.value);
    } catch (e) {
      return translatedText.value;
    }
  });

  // Methods
  const swapLanguages = () => {
    if (sourceLang.value === "auto") return;
    const temp = sourceLang.value;
    sourceLang.value = targetLang.value;
    targetLang.value = temp;

    // Also swap the text content
    const tempText = sourceText.value;
    sourceText.value = translatedText.value;
    translatedText.value = tempText;
  };

  const clearInput = () => {
    sourceText.value = "";
    translatedText.value = "";
    error.value = "";
  };

  const onSourceTextChange = () => {
    error.value = "";
  };

  const toggleLayout = () => {
    layoutMode.value = layoutMode.value === "flex" ? "block" : "flex";
  };

  const loadAvailableModels = async () => {
    if (isLoadingModels.value) return;

    isLoadingModels.value = true;

    try {
      // Use proxy endpoint in development to avoid CORS issues
      const apiUrl = import.meta.env.DEV
        ? "/api/lm-studio/v1/models"
        : `${lmStudioUrl.value}/v1/models`;

      const response = await axios.get(apiUrl, {
        timeout: 10000, // 10 second timeout
      });

      if (response.data && response.data.data) {
        const models = response.data.data.map((model: any) => model.id);
        availableModels.value = models;

        // If no model is selected or the selected model is not available, select the first one
        if (!selectedModel.value || !models.includes(selectedModel.value)) {
          selectedModel.value = models[0] || "";
        }
      }
    } catch (err: any) {
      console.warn("Failed to load models from LM Studio:", err);
      // If we can't load models, keep the current selected model or use a default
      if (!selectedModel.value) {
        selectedModel.value = "local-model";
      }
    } finally {
      isLoadingModels.value = false;
    }
  };

  const debounceAutoTranslate = () => {
    if (!enableAutoTranslate.value || !sourceText.value.trim()) return;

    // Clear existing timer
    if (debounceTimer.value) {
      clearTimeout(debounceTimer.value);
    }

    // Set new timer for 1 second debounce
    debounceTimer.value = setTimeout(() => {
      translateText();
    }, 500);
  };

  const translateText = async () => {
    if (!sourceText.value.trim()) return;

    isTranslating.value = true;
    error.value = "";
    translatedText.value = "";

    try {
      const sourceLangText =
        sourceLang.value === "auto"
          ? "the source language"
          : getLanguageName(sourceLang.value);
      const targetLangText = getLanguageName(targetLang.value);

      const prompt = `Translate the following text from ${sourceLangText} to ${targetLangText}. Preserve all markdown formatting exactly.\n\nText to translate:\n${sourceText.value}`;

      // Use proxy endpoint in development to avoid CORS issues
      const apiUrl = import.meta.env.DEV
        ? "/api/lm-studio/v1/chat/completions"
        : `${lmStudioUrl.value}/v1/chat/completions`;

      const requestBody = {
        model: selectedModel.value || "local-model", // Use selected model
        messages: [
          {
            role: "system",
            content:
              "You are a professional translator. Translate the given text accurately while preserving the original meaning and tone.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 4000,
        stream: enableStreaming.value,
      };

      if (enableStreaming.value) {
        await handleStreamingTranslation(apiUrl, requestBody);
      } else {
        await handleNonStreamingTranslation(apiUrl, requestBody);
      }
    } catch (err: any) {
      console.error("Translation error:", err);
      if (err.code === "ECONNREFUSED") {
        error.value =
          "Cannot connect to LM Studio. Make sure it's running and the URL is correct.";
      } else if (err.response?.status === 404) {
        error.value =
          "LM Studio API endpoint not found. Check if a model is loaded.";
      } else if (err.message?.includes("timeout")) {
        error.value =
          "Translation timeout. Try with shorter text or check your connection.";
      } else {
        error.value =
          err.response?.data?.error?.message ||
          err.message ||
          "Translation failed. Please try again.";
      }
    } finally {
      isTranslating.value = false;
    }
  };

  const handleNonStreamingTranslation = async (
    apiUrl: string,
    requestBody: any
  ) => {
    const response = await axios.post(apiUrl, requestBody, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000, // 30 second timeout
    });

    if (response.data && response.data.choices && response.data.choices[0]) {
      translatedText.value = response.data.choices[0].message.content.trim();
    } else {
      throw new Error("Invalid response format from LM Studio");
    }
  };

  const handleStreamingTranslation = async (apiUrl: string, requestBody: any) => {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Failed to get response stream reader");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");

        // Keep the last potentially incomplete line in the buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmedLine = line.trim();

          if (trimmedLine === "data: [DONE]") {
            return;
          }

          if (trimmedLine.startsWith("data: ")) {
            try {
              const jsonStr = trimmedLine.slice(6); // Remove "data: " prefix
              const data = JSON.parse(jsonStr);

              if (data.choices && data.choices[0] && data.choices[0].delta) {
                const content = data.choices[0].delta.content;
                if (content) {
                  translatedText.value += content;
                }
              }
            } catch (parseError) {
              // Ignore JSON parse errors for malformed chunks
              console.warn("Failed to parse streaming chunk:", parseError);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  };

  const copyTranslation = async () => {
    try {
      await navigator.clipboard.writeText(translatedText.value);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = translatedText.value;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
  };

  const getLanguageName = (code: string): string => {
    const languages: Record<string, string> = {
      en: "English",
      es: "Spanish",
      fr: "French",
      de: "German",
      it: "Italian",
      pt: "Portuguese",
      ru: "Russian",
      ja: "Japanese",
      ko: "Korean",
      zh: "Chinese",
    };
    return languages[code] || code;
  };

  // Save settings to localStorage
  watch(
    [lmStudioUrl, sourceLang, targetLang, enableStreaming, layoutMode, selectedModel, enableAutoTranslate],
    () => {
      localStorage.setItem(
        "translateApp_settings",
        JSON.stringify({
          lmStudioUrl: lmStudioUrl.value,
          sourceLang: sourceLang.value,
          targetLang: targetLang.value,
          enableStreaming: enableStreaming.value,
          layoutMode: layoutMode.value,
          selectedModel: selectedModel.value,
          enableAutoTranslate: enableAutoTranslate.value,
        })
      );
    },
    { deep: true }
  );

  // Load settings from localStorage on mount
  const loadSettings = () => {
    try {
      const saved = localStorage.getItem("translateApp_settings");
      if (saved) {
        const settings = JSON.parse(saved);
        lmStudioUrl.value = settings.lmStudioUrl || "http://localhost:1234";
        sourceLang.value = settings.sourceLang || "auto";
        targetLang.value = settings.targetLang || "en";
        enableStreaming.value =
          settings.enableStreaming !== undefined
            ? settings.enableStreaming
            : true;
        layoutMode.value = settings.layoutMode || "flex";
        selectedModel.value = settings.selectedModel || "";
        enableAutoTranslate.value =
          settings.enableAutoTranslate !== undefined
            ? settings.enableAutoTranslate
            : false;
      }
    } catch (e) {
      console.warn("Failed to load settings from localStorage");
    }
  };

  // Initialize settings and load models
  loadSettings();

  // Load models when LM Studio URL changes
  watch(lmStudioUrl, () => {
    if (lmStudioUrl.value) {
      loadAvailableModels();
    }
  }, { immediate: true });

  // Watch for sourceText changes to trigger auto-translate
  watch(sourceText, () => {
    if (enableAutoTranslate.value && sourceText.value.trim()) {
      debounceAutoTranslate();
    }
  });

  return {
    // State
    lmStudioUrl,
    sourceLang,
    targetLang,
    sourceText,
    translatedText,
    enableMarkdown,
    enableStreaming,
    enableAutoTranslate,
    isTranslating,
    error,
    layoutMode,
    availableModels,
    selectedModel,
    isLoadingModels,

    // Computed
    translatedMarkdownHtml,

    // Methods
    swapLanguages,
    clearInput,
    onSourceTextChange,
    translateText,
    copyTranslation,
    toggleLayout,
    loadAvailableModels,
  };
}
