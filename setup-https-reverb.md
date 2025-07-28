# Configuration HTTPS + WSS pour Reverb avec Laragon

## 1. Configuration NGINX

Copiez le fichier `laragon-nginx-reverb.conf` dans :
```
C:\laragon\etc\nginx\sites-enabled\rtfm2win-reverb.conf
```

## 2. Redémarrer NGINX dans Laragon

1. Ouvrir Laragon
2. Clic droit sur l'icône Laragon
3. NGINX → Reload Config
4. Ou redémarrer complètement Laragon

## 3. Configuration des certificats SSL

### Option A : Utiliser les certificats Laragon existants
Les certificats sont généralement dans :
```
C:\laragon\etc\ssl\laragon.crt
C:\laragon\etc\ssl\laragon.key
```

### Option B : Générer des certificats spécifiques (optionnel)
```bash
# Dans le dossier C:\laragon\etc\ssl\
openssl req -x509 -newkey rsa:4096 -keyout rtfm2win.key -out rtfm2win.crt -days 365 -nodes
```

## 4. Démarrer les services

### Terminal 1 : Laravel + Queue + Vite
```bash
composer run dev
```

### Terminal 2 : Reverb (HTTP sur port 8080)
```bash
php artisan reverb:start
```

## 5. Test de la configuration

1. **Site web** : https://rtfm2win.ovh
2. **WebSocket** : wss://rtfm2win.ovh:8081
3. **Vérification** : Ouvrir la console du navigateur, il ne devrait plus y avoir d'erreurs WebSocket

## 6. Dépannage

### Si les certificats ne fonctionnent pas :
1. Vérifier que les chemins dans `rtfm2win-reverb.conf` sont corrects
2. Redémarrer Laragon complètement
3. Vider le cache du navigateur

### Si le proxy ne fonctionne pas :
1. Vérifier que le port 8081 n'est pas utilisé par un autre service
2. Tester manuellement : `curl -k https://rtfm2win.ovh:8081`

### Logs NGINX :
```
C:\laragon\etc\nginx\logs\error.log
```

## 7. Architecture finale

```
Browser (HTTPS) → https://rtfm2win.ovh
           ↓
WebSocket (WSS) → wss://rtfm2win.ovh:8081
           ↓
NGINX Proxy → http://127.0.0.1:8080
           ↓
Laravel Reverb Server
```