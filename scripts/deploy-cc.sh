cp /mnt/c/Users/James/.ssh/vidismart-deploy /tmp/vd
chmod 600 /tmp/vd

sftp -P 18765 -i /tmp/vd -o StrictHostKeyChecking=no sftp6806-64fc400c@sftp.siteground.net <<'SFTP_COMMANDS'
put /mnt/m/code/vidismart/cc/index.html caribbeanconsultants.net/caribbeanconsultants.net/public_html/index.html
put /mnt/m/code/vidismart/cc/projects.html caribbeanconsultants.net/caribbeanconsultants.net/public_html/projects.html
put /mnt/m/code/vidismart/cc/video.html caribbeanconsultants.net/caribbeanconsultants.net/public_html/video.html
put /mnt/m/code/vidismart/cc/about-us.html caribbeanconsultants.net/caribbeanconsultants.net/public_html/about-us.html
put /mnt/m/code/vidismart/cc/leadership.html caribbeanconsultants.net/caribbeanconsultants.net/public_html/leadership.html
put /mnt/m/code/vidismart/cc/services.html caribbeanconsultants.net/caribbeanconsultants.net/public_html/services.html
put /mnt/m/code/vidismart/cc/contact.html caribbeanconsultants.net/caribbeanconsultants.net/public_html/contact.html
put /mnt/m/code/vidismart/cc/script-v3.js caribbeanconsultants.net/caribbeanconsultants.net/public_html/script-v3.js
put /mnt/m/code/vidismart/cc/styles.css caribbeanconsultants.net/caribbeanconsultants.net/public_html/styles.css
put /mnt/m/code/vidismart/cc/assets/images/project-16-sochi.png caribbeanconsultants.net/caribbeanconsultants.net/public_html/assets/images/project-16-sochi.png
put /mnt/m/code/vidismart/cc/assets/images/project-17-fortuna.png caribbeanconsultants.net/caribbeanconsultants.net/public_html/assets/images/project-17-fortuna.png
bye
SFTP_COMMANDS
