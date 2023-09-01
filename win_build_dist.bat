call create-archive.bat

cd out
xcopy /Y /s ..\src\assets\icon.png .\

7z.exe a artifact.zip icon.png

del icon.png

del cloud-cost-app.zip

ren artifact.zip cloud-cost-app.zip

cd ..