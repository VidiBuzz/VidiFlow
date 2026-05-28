@echo off
sftp -i "C:\Users\James\.ssh\vidismart-deploy" -P 18765 sftp6806-64fc400c@sftp.siteground.net ^< deploy-cc-batch.txt
