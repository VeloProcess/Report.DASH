@echo off
echo Configurando Git...
git config user.name "Gabriel"
git config user.email "gabriel.araujo@velotax.com.br"

echo Fazendo commit...
git commit -m "primeiro commit"

echo Removendo remote origin existente...
git remote remove origin

echo Adicionando novo remote origin...
git remote add origin https://github.com/VeloProcess/Relat-rios.git

echo Fazendo push para GitHub...
git push -u origin main

echo Concluido!
pause

