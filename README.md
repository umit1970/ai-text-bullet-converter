# 🚀 AI Text Bullet Converter - Chrome Extension

Modern ve güvenli bir browser extension'ı ile seçtiğiniz metni AI kullanarak İngilizce bullet pointlere dönüştürün!

## ✨ Özellikler

### 🤖 Çoklu AI Provider Desteği
- **OpenAI** (GPT-4, GPT-3.5 Turbo)
- **DeepSeek** (Yüksek performans, düşük maliyet)
- **Mistral AI** (Açık kaynak dostum)
- **Qwen** (Alibaba Cloud)
- **Ollama** (Yerel AI - tamamen offline)
- **Anthropic** (Claude 3)
- **Groq** (Ultra hızlı çıkarım)

### 🔐 Güvenlik
- ✅ **AES-256-GCM Şifreleme**: API anahtarlarınız askeri düzeyde şifrelenir
- ✅ **Yerel Depolama**: Tüm veriler sadece tarayıcınızda saklanır
- ✅ **Zero-knowledge**: API anahtarlarınızı kimse göremez
- ✅ **Encrypted Storage**: Chrome Storage API ile güvenli saklama

### 🎨 Kullanıcı Deneyimi
- 🎯 **Basit Arayüz**: Minimalist ve modern tasarım
- ⚡ **Hızlı Erişim**: Keyboard shortcut ile anında dönüştürme
- 🖱️ **Sağ Tık Menüsü**: Context menu entegrasyonu
- 💫 **Canlı Popup**: Sonuçlar güzel bir popup'ta gösterilir
- 📋 **Tek Tık Kopyalama**: Sonuçları kolayca kopyalayın

### ⚙️ Özelleştirme
- 📝 **Custom Prompt**: Kendi prompt şablonunuzu yazın
- 🎨 **Buton Stili**: CSS ile istediğiniz gibi özelleştirin
- ⌨️ **Keyboard Shortcut**: Ctrl+Shift+B (veya Cmd+Shift+B Mac'te)
- 🔧 **Model Seçimi**: Her provider için farklı modeller seçin

## 📦 Kurulum

### 1. Extension'ı Yükleyin

```bash
# 1. Bu repoyu klonlayın veya ZIP olarak indirin
git clone <repo-url>

# 2. Chrome'u açın ve şu adrese gidin:
chrome://extensions/

# 3. Sağ üstten "Geliştirici modu"nu açın

# 4. "Paketlenmemiş uzantı yükleyin" butonuna tıklayın

# 5. Extension klasörünü seçin
```

### 2. API Key Alın

Kullanmak istediğiniz AI provider'dan API key alın:

- **OpenAI**: https://platform.openai.com/api-keys
- **DeepSeek**: https://platform.deepseek.com/api_keys
- **Mistral**: https://console.mistral.ai/api-keys/
- **Qwen**: https://dashscope.console.aliyun.com/
- **Ollama**: Yerel kurulum gerekir - https://ollama.ai/
- **Anthropic**: https://console.anthropic.com/
- **Groq**: https://console.groq.com/

### 3. Extension'ı Yapılandırın

1. Extension ikonuna tıklayın
2. AI Provider'ınızı seçin
3. API Key'inizi girin (şifrelenmiş olarak saklanır)
4. İsterseniz model adı girin (opsiyonel)
5. İsterseniz custom prompt yazın
6. "Save Settings" butonuna tıklayın
7. "Test API" ile bağlantıyı test edin

## 🎯 Kullanım

### Yöntem 1: Otomatik Buton
1. Herhangi bir web sayfasında metin seçin (minimum 10 karakter)
2. "✨ Convert to Bullets" butonu otomatik çıkar
3. Butona tıklayın
4. AI sonuçları popup'ta gösterilir

### Yöntem 2: Sağ Tık Menüsü
1. Metin seçin
2. Sağ tıklayın
3. "Convert to Bullet Points" seçeneğini tıklayın

### Yöntem 3: Keyboard Shortcut
1. Metin seçin
2. **Ctrl+Shift+B** (Windows/Linux) veya **Cmd+Shift+B** (Mac) tuşlarına basın
3. Anında dönüştürme başlar

## 🛠️ Özelleştirme

### Custom Prompt Şablonu

Prompt şablonunda `{text}` placeholder'ını kullanın:

```
Convert the following text into clear, concise English bullet points: {text}
```

Örnekler:
- `Summarize this in 3 bullet points: {text}`
- `Create action items from: {text}`
- `Extract key points as bullets: {text}`
- `Make a bullet list in English: {text}`

### Buton Stilini Değiştirme

`content.css` dosyasını düzenleyin:

```css
.ai-converter-button {
    background: linear-gradient(135deg, #your-color-1, #your-color-2);
    border-radius: 20px; /* Yuvarlama miktarı */
    padding: 10px 16px; /* İç boşluk */
    font-size: 13px; /* Yazı boyutu */
}
```

### Keyboard Shortcut Değiştirme

`manifest.json` dosyasında:

```json
"commands": {
    "convert-text": {
        "suggested_key": {
            "default": "Ctrl+Shift+B",
            "mac": "Command+Shift+B"
        }
    }
}
```

## 🔒 Güvenlik Detayları

### API Key Şifreleme

Extension, API anahtarlarınızı şifrelemek için modern kriptografi kullanır:

1. **AES-GCM 256-bit şifreleme**: NSA onaylı şifreleme standardı
2. **Unique IV**: Her şifreleme için benzersiz initialization vector
3. **Web Crypto API**: Tarayıcı native şifreleme
4. **Local-only**: Anahtarlar hiçbir zaman sunucuya gönderilmez

### Kod İncelemesi

Tüm kod açık kaynak ve incelenebilir:
- `background.js`: API çağrıları (API key'ler memory'de tutulmaz)
- `popup.js`: Şifreleme/deşifreleme mantığı
- `content.js`: Sayfa entegrasyonu (API key erişimi yok)

## 📊 Desteklenen AI Modelleri

| Provider | Varsayılan Model | Alternatif Modeller |
|----------|------------------|-------------------|
| OpenAI | gpt-3.5-turbo | gpt-4, gpt-4-turbo |
| DeepSeek | deepseek-chat | deepseek-coder |
| Mistral | mistral-small-latest | mistral-medium, mistral-large |
| Qwen | qwen-turbo | qwen-plus, qwen-max |
| Ollama | llama3 | mistral, codellama, phi |
| Anthropic | claude-3-sonnet | claude-3-opus, claude-3-haiku |
| Groq | mixtral-8x7b-32768 | llama2-70b, gemma-7b |

## 🐛 Sorun Giderme

### "No API key configured" hatası
- Extension ayarlarına gidin ve API key kaydedin
- "Test API" butonu ile bağlantıyı kontrol edin

### "API error (401)" hatası
- API key'inizin doğru olduğundan emin olun
- Provider web sitesinde key'inizin aktif olduğunu kontrol edin

### Ollama bağlanamıyor
- Ollama'nın çalıştığından emin olun: `ollama serve`
- http://localhost:11434 adresinin erişilebilir olduğunu kontrol edin

### Buton görünmüyor
- En az 10 karakter seçtiğinizden emin olun
- Sayfayı yenileyin
- Extension'ın aktif olduğunu kontrol edin

## 🚀 Gelecek Özellikler

- [ ] Dil seçeneği (İngilizce, Türkçe, vb.)
- [ ] Birden fazla output formatı (bullets, numbered, summary)
- [ ] Sonuç geçmişi
- [ ] Favori promptlar
- [ ] Toplu metin işleme
- [ ] PDF/DOC export
- [ ] Dark mode

## 📝 Lisans

MIT License - Ticari ve kişisel kullanım için özgürsünüz!

## 🤝 Katkıda Bulunun

Pull request'ler memnuniyetle karşılanır!

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing`)
5. Pull Request açın

## 📞 İletişim

Sorularınız için issue açabilirsiniz.

## ⭐ Beğendiyseniz

Bu projeyi beğendiyseniz GitHub'da ⭐ vermeyi unutmayın!

---

**Not**: Bu extension API anahtarlarınızı güvenli bir şekilde saklar ancak API kullanımı için provider'ınızın fiyatlandırmasını kontrol etmeyi unutmayın. Özellikle OpenAI ve Anthropic gibi ücretli servislerde kullanım limitlerini takip edin.
