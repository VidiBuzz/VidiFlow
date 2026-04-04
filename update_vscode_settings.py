import json
import os

settings_path = os.path.expandvars(r'%APPDATA%\Code\User\settings.json')

# Read the current settings
with open(settings_path, 'r') as f:
    settings = json.load(f)

# Update the Ubuntu (WSL) profile
if 'terminal.integrated.profiles.windows' in settings:
    settings['terminal.integrated.profiles.windows']['Ubuntu (WSL)'] = {
        'path': 'C:\\WINDOWS\\System32\\bash.exe',
        'args': ['--login', '-c', 'cd /mnt/m/code/vidismart && exec bash']
    }

# Write back with proper formatting
with open(settings_path, 'w') as f:
    json.dump(settings, f, indent=4)

print('Successfully updated Ubuntu (WSL) profile')
print('Please reload VS Code window (Ctrl+Shift+P -> Reload Window)')