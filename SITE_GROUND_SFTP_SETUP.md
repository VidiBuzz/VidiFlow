# SiteGround SFTP Connection Details

## For SFTP Client (FileZilla, WinSCP, Cyberduck, etc.)

### Connection Information:
- **Host**: sftp.siteground.net
- **Port**: 18765
- **Username**: sftp7099-64fc400c
- **Password**: [Your SiteGround password - not stored in repo for security]
- **Protocol**: SFTP - SSH File Transfer Protocol
- **Logon Type**: Normal

### Alternative SSH Connection (for terminal/command line):
```bash
sftp -P 18765 sftp7099-64fc400c@sftp.siteground.net
```

### Or using SSH:
```bash
ssh -p 18765 sftp7099-64fc400c@sftp.siteground.net
```

## Existing SSH Config Entries (in ~/.ssh/config):

### For vidismart.com:
```
Host vidismart
    HostName gtxm1044.siteground.biz
    User u2627-m33aqlpqghg3
    Port 18765
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

### For siteground-all-master:
```
Host siteground-all-master
    HostName gtxm1044.siteground.biz
    User u2627-m33aqlpqghg3
    Port 18765
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

## From vidiflow/.env (alternative credentials):
```
SITEGROUND_HOST=gtxm1144.siteground.biz
SITEGROUND_PORT=18765
SITEGROUND_USER=u2157-izargh0dtgjj
SITEGROUND_SSH_KEY=modalityvector_new_key
```

## Quick Connect String for SFTP Clients:
```
sftp://sftp7099-64fc400c@sftp.siteground.net:18765
```

## Notes:
1. Replace `[Your SiteGround password]` with your actual password
2. The SFTP connection should give you access to the web root directories
3. For managing multiple sites, you may need to navigate to the appropriate `/home/username/www/` directories
4. If key-based authentication is preferred, ensure your public key is added to SiteGround's authorized_keys

## To Test Connection:
1. Open your SFTP client
2. Enter the host, port, username, and password
3. Click "Connect" or "Quickconnect"
4. You should see the remote filesystem of your SiteGround account

**IMPORTANT**: Never share your password publicly. This document should be kept secure.