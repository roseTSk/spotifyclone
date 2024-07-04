document.addEventListener('DOMContentLoaded', () => {
    const favButtons = document.querySelectorAll('.fav-btn');

    // Function to handle click on favourite button
    function handleFavouriteClick(event) {
        const button = event.currentTarget;
        button.classList.toggle('selected'); // Toggle 'selected' class on button

        const item = getItemDetails(button);

        if (button.classList.contains('selected')) {
            saveItemToFavourites(item); // Save item to localStorage
        } else {
            removeItemFromFavourites(item); // Remove item from localStorage
        }
    }

    // Function to extract item details based on button context
    function getItemDetails(button) {
        const itemElement = button.closest('.m-item, .v-item');
        const isAudio = itemElement.classList.contains('m-item');
        const sourceElement = itemElement.querySelector(isAudio ? 'audio source' : 'video source');
        const name = sourceElement.getAttribute('src');
        const backgroundImage = isAudio ? encodeURIComponent(itemElement.querySelector('.m-img').getAttribute('style')) : '';
        const poster = !isAudio ? encodeURIComponent(itemElement.querySelector('video').getAttribute('poster')) : '';

        return {
            type: isAudio ? 'audio' : 'video',
            name,
            backgroundImage,
            poster
        };
    }

    // Function to save item to localStorage
    function saveItemToFavourites(item) {
        let savedItems = JSON.parse(localStorage.getItem('savedItems')) || [];
        // Check if item already exists
        if (!savedItems.some(savedItem => savedItem.name === item.name)) {
            savedItems.push(item);
            localStorage.setItem('savedItems', JSON.stringify(savedItems));
        }
    }

    // Function to remove item from localStorage
    function removeItemFromFavourites(item) {
        let savedItems = JSON.parse(localStorage.getItem('savedItems')) || [];
        savedItems = savedItems.filter(savedItem => savedItem.name !== item.name);
        localStorage.setItem('savedItems', JSON.stringify(savedItems));
    }

    // Attach click event listener to all fav buttons
    favButtons.forEach(button => {
        button.addEventListener('click', handleFavouriteClick);
    });

    // Load favourite items on favourites.html
    if (window.location.pathname.includes('favourites.html')) {
        const favouriteAudiosContainer = document.querySelector('.favourite-audios .list');
        const favouriteVideosContainer = document.querySelector('.favourite-videos .list');
        const savedItems = JSON.parse(localStorage.getItem('savedItems')) || [];

        savedItems.forEach(item => {
            if (item.type === 'audio') {
                appendAudioItem(favouriteAudiosContainer, item);
            } else if (item.type === 'video') {
                appendVideoItem(favouriteVideosContainer, item);
            }
        });

        // Show 'No selected audios' or 'No selected videos' message if no items are saved
        if (favouriteAudiosContainer.children.length === 0) {
            document.querySelector('.favourite-audios .no-items').style.display = 'block';
        }
        if (favouriteVideosContainer.children.length === 0) {
            document.querySelector('.favourite-videos .no-items').style.display = 'block';
        }
    }

    // Function to append audio item to favourites section
    function appendAudioItem(container, item) {
        const audioItem = document.createElement('div');
        audioItem.classList.add('m-item');
        audioItem.innerHTML = `
            <div class="m-img" style=" ${decodeURIComponent(item.backgroundImage)}"></div>
            <audio controls>
                <source src="${item.name}" type="audio/mp3">
            </audio>
            <button class="fav-btn selected">
                <i class="fa-solid fa-heart"></i>
            </button>
        `;
        container.appendChild(audioItem);
    }

    // Function to append video item to favourites section
    function appendVideoItem(container, item) {
        const videoItem = document.createElement('div');
        videoItem.classList.add('v-item');
        videoItem.innerHTML = `
            <video controls poster="${decodeURIComponent(item.poster)}">
                <source src="${item.name}" type="video/mp4">
            </video>
            <button class="fav-btn selected">
                <i class="fa-solid fa-heart"></i>
            </button>
        `;
        container.appendChild(videoItem);
    }
});


document.addEventListener('DOMContentLoaded', () => {
    const audioElement = document.getElementById('audio-element');
    const playButton = document.getElementById('play-button');
    const trackNameDisplay = document.getElementById('track-name');
    const audioPlayer = document.getElementById('audio-player');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const trackList = document.querySelectorAll('.track');
    const progressBar = document.getElementById('progress-filled');
    let currentTrackIndex = -1;
    let isPlaying = false;
    let progressInterval;

    function playTrack(index) {
        const trackButton = trackList[index];
        const trackSrc = trackButton.getAttribute('data-src');
        const trackName = trackButton.getAttribute('data-name');
        const trackImg = trackButton.getAttribute('data-img');

        audioElement.pause();
        audioElement.src = trackSrc;
        trackNameDisplay.textContent = trackName;
        audioElement.load();
        audioElement.play().then(() => {
            playButton.innerHTML = '<i class="fa-solid fa-circle-pause"></i>';
            audioPlayer.style.backgroundImage = `url(${trackImg})`;
            isPlaying = true;
            startProgress();
        }).catch(error => {
            console.error('Error playing the track:', error);
        });

        currentTrackIndex = index;
    }

    function startProgress() {
        progressInterval = setInterval(() => {
            const progress = (audioElement.currentTime / audioElement.duration) * 100;
            progressBar.style.width = progress + '%';
        }, 1000);
    }

    function stopProgress() {
        clearInterval(progressInterval);
    }

    playButton.addEventListener('click', () => {
        if (isPlaying) {
            audioElement.pause();
            playButton.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
            isPlaying = false;
            stopProgress();
        } else {
            audioElement.play();
            playButton.innerHTML = '<i class="fa-solid fa-circle-pause"></i>';
            isPlaying = true;
            startProgress();
        }
    });

    prevButton.addEventListener('click', () => {
        let newIndex = currentTrackIndex - 1;
        if (newIndex < 0) {
            newIndex = trackList.length - 1;
        }
        playTrack(newIndex);
    });

    nextButton.addEventListener('click', () => {
        let newIndex = currentTrackIndex + 1;
        if (newIndex >= trackList.length) {
            newIndex = 0;
        }
        playTrack(newIndex);
    });

    trackList.forEach((trackButton, index) => {
        trackButton.addEventListener('click', () => {
            if (index !== currentTrackIndex) {
                playTrack(index);
            } else {
                if (isPlaying) {
                    audioElement.pause();
                    playButton.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
                    isPlaying = false;
                    stopProgress();
                } else {
                    audioElement.play();
                    playButton.innerHTML = '<i class="fa-solid fa-circle-pause"></i>';
                    isPlaying = true;
                    startProgress();
                }
            }
        });
    });

    audioElement.addEventListener('ended', () => {
        playButton.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
        isPlaying = false;
        stopProgress();
        let newIndex = currentTrackIndex + 1;
        if (newIndex >= trackList.length) {
            newIndex = 0;
        }
        playTrack(newIndex);
    });
});