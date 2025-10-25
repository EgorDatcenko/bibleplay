# 🚀 Настройка Vercel для P2P-решения

## 📋 Переменные окружения для Vercel

В Vercel Dashboard → Settings → Environment Variables добавьте:

### **Обязательные переменные:**

```
FIREBASE_API_KEY = AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
FIREBASE_AUTH_DOMAIN = bibleplay-p2p.firebaseapp.com
FIREBASE_DATABASE_URL = https://bibleplay-p2p-default-rtdb.europe-west1.firebasedatabase.app
FIREBASE_PROJECT_ID = bibleplay-p2p
FIREBASE_STORAGE_BUCKET = bibleplay-p2p.appspot.com
FIREBASE_MESSAGING_SENDER_ID = 931731334835
FIREBASE_APP_ID = 1:931731334835:web:XXXXXXXXXXXXXXXX
```

## 🔧 **Настройка домена**

### **1. Основной домен:**
- **URL Vercel**: `bibleplay-h1kluvl43-egors-projects-f86fbb5c.vercel.app`
- **Ваш домен**: `bibleplay.ru`

### **2. Настройка кастомного домена:**
1. В Vercel Dashboard → Settings → Domains
2. Добавьте `bibleplay.ru`
3. Настройте DNS записи:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

## 🧪 **Тестирование API**

### **Проверка API функций:**
```bash
# Проверка создания комнаты
curl -X POST https://bibleplay-h1kluvl43-egors-projects-f86fbb5c.vercel.app/api/coordination?action=create-room \
  -H "Content-Type: application/json" \
  -d '{"roomId":"test123","hostId":"host123","playerName":"Test Player"}'

# Проверка поиска комнаты
curl https://bibleplay-h1kluvl43-egors-projects-f86fbb5c.vercel.app/api/coordination?action=find-room&roomId=test123

# Проверка статистики
curl https://bibleplay-h1kluvl43-egors-projects-f86fbb5c.vercel.app/api/coordination?action=stats
```

## 📊 **Мониторинг**

### **Логи Vercel:**
- Vercel Dashboard → Functions → View Logs
- Мониторинг ошибок и производительности

### **Firebase Console:**
- [Firebase Console](https://console.firebase.google.com)
- Realtime Database → Data
- Мониторинг активных комнат

## 🚀 **Деплой**

### **Автоматический деплой:**
```bash
# Коммит в GitHub автоматически запускает деплой
git add .
git commit -m "feat: P2P-решение готово"
git push origin main
```

### **Ручной деплой:**
```bash
# Установка Vercel CLI
npm i -g vercel

# Деплой
vercel --prod
```

## 🔧 **Устранение проблем**

### **Проблема: "API не отвечает"**
**Решение**: Проверьте переменные окружения в Vercel

### **Проблема: "Firebase ошибка"**
**Решение**: Проверьте конфигурацию Firebase

### **Проблема: "CORS ошибка"**
**Решение**: Проверьте настройки CORS в API функции

## 📈 **Производительность**

### **Бесплатные лимиты Vercel:**
- ✅ **100GB трафика/месяц**
- ✅ **1000 запросов/день**
- ✅ **Бесплатный SSL**
- ✅ **Автоматические деплои**

### **Бесплатные лимиты Firebase:**
- ✅ **1GB данных**
- ✅ **100 одновременных соединений**
- ✅ **Realtime Database**

## 🎯 **Результат**

После настройки:
- ✅ **API работает** на `bibleplay-h1kluvl43-egors-projects-f86fbb5c.vercel.app`
- ✅ **Firebase подключен** к `bibleplay-p2p-default-rtdb.europe-west1.firebasedatabase.app`
- ✅ **P2P-соединения** работают через WebRTC
- ✅ **Полностью бесплатно** - 0 рублей/месяц!
