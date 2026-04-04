// xAi.js - Audio player functionality

document.addEventListener('DOMContentLoaded', function() {
    // Create an iframe element to embed Google Drive audio
    function createAudioEmbed() {
        const mediaControls = document.querySelector('.media-controls');
        if (!mediaControls) return;
        
        // Create a container for the audio player
        const audioContainer = document.createElement('div');
        audioContainer.className = 'audio-container';
        audioContainer.style.width = '100%';
        audioContainer.style.marginBottom = '1rem';
        
        // Create an iframe that embeds the Google Drive audio preview
        const iframe = document.createElement('iframe');
        iframe.src = 'https://drive.google.com/file/d/1kI9t9XjKwyVhJW503N2UKQkbbT8SKdlz/preview';
        iframe.width = '100%';
        iframe.height = '60';
        iframe.frameBorder = '0';
        iframe.allow = 'autoplay';
        iframe.style.borderRadius = '8px';
        iframe.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        
        // Add the iframe to the container
        audioContainer.appendChild(iframe);
        
        // Insert the audio container at the beginning of media controls
        mediaControls.insertBefore(audioContainer, mediaControls.firstChild);
    }
    
    // Initialize the audio player
    createAudioEmbed();
});