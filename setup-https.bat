@echo off
echo Configuration HTTPS + WSS pour RTFM2WIN
echo ========================================

REM Vérifier si Laragon est installé
if not exist "C:\laragon\" (
    echo ERREUR: Laragon n'est pas installé dans C:\laragon\
    pause
    exit /b 1
)

REM Créer le répertoire sites-enabled s'il n'existe pas
if not exist "C:\laragon\etc\nginx\sites-enabled\" mkdir "C:\laragon\etc\nginx\sites-enabled\"

REM Copier la configuration NGINX
copy "laragon-nginx-reverb.conf" "C:\laragon\etc\nginx\sites-enabled\rtfm2win-reverb.conf"
if %ERRORLEVEL% NEQ 0 (
    echo ERREUR: Impossible de copier la configuration NGINX
    pause
    exit /b 1
)

echo Configuration NGINX copiée avec succès !

REM Vérifier les certificats SSL
if exist "C:\laragon\etc\ssl\laragon.crt" (
    echo Certificats SSL trouvés dans C:\laragon\etc\ssl\
) else (
    echo ATTENTION: Certificats SSL non trouvés !
    echo Vous devrez peut-être les générer manuellement.
)

echo.
echo Instructions suivantes :
echo 1. Redémarrez Laragon (Menu → Service → Restart All)
echo 2. Lancez: composer run dev
echo 3. Dans un autre terminal: php artisan reverb:start
echo 4. Accédez à: https://rtfm2win.ovh
echo.
pause