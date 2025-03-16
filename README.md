# Tan Mahjong Server

Tan Mahjong oyunu için WebSocket tabanlı multiplayer sunucu.

## Kurulum

1. Repository'i klonlayın:
```bash
git clone https://github.com/FTanBorn/tan-mahjong-server.git
cd tan-mahjong-server
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Çevre değişkenlerini ayarlayın:
```bash
cp .env.example .env
```

4. Sunucuyu başlatın:
```bash
npm run dev
```

## Özellikler

- Socket.IO ile gerçek zamanlı iletişim
- Oyun odası yönetimi
- Oyuncu eşleştirme
- Oyun durumu senkronizasyonu

## API

### Socket Events

#### Client -> Server
- `joinRoom`: Oyun odasına katılma
- `playerReady`: Oyuncunun hazır olduğunu bildirme
- `makeMove`: Hamle yapma

#### Server -> Client
- `roomUpdate`: Oda durumu güncellemesi
- `gameStart`: Oyun başlangıcı
- `gameUpdate`: Oyun durumu güncellemesi
- `gameOver`: Oyun sonu
- `playerLeft`: Oyuncu ayrılma bildirimi

## Lisans

MIT