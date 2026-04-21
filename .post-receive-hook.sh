#!/bin/bash
while read oldrev newrev refname
do
    branch=$(echo "$refname" | sed 's|refs/heads/||')
    echo "Deploying branch: $branch"
    if [ "$branch" = "main" ]; then
        echo "HEAD is now at $newrev"
        git --work-tree=/home/customer/www/vidismart.com/public_html \
            --git-dir=/home/customer/www/vidismart.com/public_html/.git \
            checkout -f main
        git --work-tree=/home/customer/www/vidismart.com/public_html \
            --git-dir=/home/customer/www/vidismart.com/public_html/.git \
            reset --hard $newrev
        find /home/customer/www/vidismart.com/public_html \
            -not -path "*/.git/*" -type d -exec chmod 755 {} \; 2>/dev/null
        find /home/customer/www/vidismart.com/public_html \
            -not -path "*/.git/*" -type f -exec chmod 644 {} \; 2>/dev/null
        chmod +x /home/customer/www/vidismart.com/public_html/.git/hooks/post-receive
        echo "Deploy complete: main at $newrev"
    else
        echo "Skipping branch: $branch (only deploys main)"
    fi
done
