// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const gallery = document.getElementById('gallery');
const button = document.querySelector('button');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Place your API key here
const API_KEY = 'xBZzJYzQqa0Sv3vnsw9mp1DC3rK1FGsV4Fbzcl3m';

// Create a gallery item for each image or video
function createGalleryItem(data) {
  const item = document.createElement('div');
  item.classList.add('gallery-item');

  if (data.media_type === 'image') {
    // If it's an image, show the image
    const img = document.createElement('img');
    img.src = data.url;
    img.alt = data.title;

    const title = document.createElement('h3');
    title.textContent = data.title;

    const date = document.createElement('p');
    date.textContent = data.date;

    item.appendChild(img);
    item.appendChild(title);
    item.appendChild(date);

    // Modal logic for images
    item.addEventListener('click', () => openModal(data));
  } else if (data.media_type === 'video' && data.url.includes('youtube.com')) {
    // If it's a YouTube video, show a thumbnail with a play button
    const videoId = data.url.split('embed/')[1] || '';
    const thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    const thumb = document.createElement('div');
    thumb.style.position = 'relative';

    const img = document.createElement('img');
    img.src = thumbUrl;
    img.alt = data.title;
    img.style.width = '100%';
    img.style.display = 'block';
    img.style.borderRadius = '4px';

    // Play button overlay
    const playBtn = document.createElement('div');
    playBtn.innerHTML = '&#9658;'; // Play symbol
    playBtn.style.position = 'absolute';
    playBtn.style.top = '50%';
    playBtn.style.left = '50%';
    playBtn.style.transform = 'translate(-50%, -50%)';
    playBtn.style.fontSize = '48px';
    playBtn.style.color = 'white';
    playBtn.style.textShadow = '0 0 10px black';
    playBtn.style.pointerEvents = 'none';

    thumb.appendChild(img);
    thumb.appendChild(playBtn);
    item.appendChild(thumb);

    const title = document.createElement('h3');
    title.textContent = data.title;
    item.appendChild(title);
    const date = document.createElement('p');
    date.textContent = data.date;
    item.appendChild(date);

    // Modal logic for YouTube videos
    item.addEventListener('click', () => openVideoModal(data.url, data.title, data.date));
  }

  return item;
}

// Show a loading message while fetching
function showLoadingMessage() {
  gallery.innerHTML = '<p id="loading">Loading Space Images ᕙ( ͡° ͜ʖ ͡°)ᕗ...</p>';
}

// Clear the gallery
function clearGallery() {
  gallery.innerHTML = '';
}

// Fetch images from NASA's API for the selected date range
function fetchImages(startDate, endDate) {
  const start = new Date(startDate);
  const images = [];

  for (let i = 0; i < 9; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    images.push(date.toISOString().split('T')[0]);
  }

  const promises = images.map(date => {
    return fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&date=${date}`)
      .then(res => res.json());
  });

  return Promise.all(promises);
}

// When the button is clicked, fetch and display images
button.addEventListener('click', () => {
  const startDate = startInput.value;
  const endDate = endInput.value;
  showLoadingMessage();

  fetchImages(startDate, endDate)
    .then(dataArray => {
      clearGallery();
      dataArray.forEach(data => {
        if (data.media_type === 'image' || (data.media_type === 'video' && data.url.includes('youtube.com'))) {
          const item = createGalleryItem(data);
          gallery.appendChild(item);
        }
      });
    })
    .catch(err => {
      gallery.innerHTML = '<p>Error fetching data. Please try again.</p>';
      console.error(err);
    });
});

// Modal creation
const modal = document.createElement('div');
modal.id = 'modal';
modal.style.display = 'none';
modal.style.position = 'fixed';
modal.style.top = '0';
modal.style.left = '0';
modal.style.width = '100%';
modal.style.height = '100%';
modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
modal.style.justifyContent = 'center';
modal.style.alignItems = 'center';
modal.style.padding = '20px';
modal.style.boxSizing = 'border-box';
modal.style.zIndex = '1000';
modal.style.transition = 'opacity 0.3s';
modal.style.opacity = '0';
modal.innerHTML = `
  <div id="modal-content" style="background: white; padding: 20px; border-radius: 8px; max-width: 800px; max-height: 90vh; overflow-y: auto; position: relative;">
    <button id="modal-close" style="position: sticky; top: 10px; right: 10px; z-index: 10; background: #eee; border: none; border-radius: 50%; width: 40px; height: 40px; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
    <img id="modal-img" style="width: 100%; border-radius: 4px;" />
    <h2 id="modal-title" style="font-family: 'Public Sans', sans-serif;"></h2>
    <p id="modal-date" style="margin-bottom: 1em; font-family: 'Inter', sans-serif;"></p>
    <p id="modal-explanation" style="font-family: Helvetica, sans-serif;"></p>
  </div>
`;
document.body.appendChild(modal);

// Open the modal with image details
function openModal(data) {
  document.getElementById('modal-img').src = data.hdurl || data.url;
  document.getElementById('modal-title').textContent = data.title;
  document.getElementById('modal-date').textContent = data.date;
  document.getElementById('modal-explanation').textContent = data.explanation;
  modal.style.display = 'flex';
  setTimeout(() => { modal.style.opacity = '1'; }, 10);
}

// Add a modal for YouTube videos
function openVideoModal(videoUrl, title, date) {
  // Reuse the existing modal
  const modalContent = document.getElementById('modal-content');
  modalContent.innerHTML = `
    <button id="modal-close" style="position: absolute; top: 10px; right: 10px;">X</button>
    <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px;">
      <iframe src="${videoUrl}?autoplay=1" frameborder="0" allowfullscreen style="position: absolute; top:0; left:0; width:100%; height:100%;"></iframe>
    </div>
    <h2 style="font-family: 'Public Sans', sans-serif;">${title}</h2>
    <p style="margin-bottom: 1em; font-family: 'Inter', sans-serif;">${date}</p>
  `;
  modal.style.display = 'flex';
  setTimeout(() => { modal.style.opacity = '1'; }, 10);
  document.getElementById('modal-close').onclick = () => {
    modal.style.display = 'none';
    modal.style.opacity = '0';
    // Restore modal content for images
    modalContent.innerHTML = `
      <button id="modal-close" style="position: absolute; top: 10px; right: 10px;">X</button>
      <img id="modal-img" style="width: 100%; border-radius: 4px;" />
      <h2 id="modal-title" style="font-family: 'Public Sans', sans-serif;"></h2>
      <p id="modal-date" style="margin-bottom: 1em; font-family: 'Inter', sans-serif;"></p>
      <p id="modal-explanation" style="font-family: Helvetica, sans-serif;"></p>
    `;
    document.getElementById('modal-close').onclick = () => {
      modal.style.display = 'none';
      modal.style.opacity = '0';
    };
  };
}
document.getElementById('modal-close').addEventListener('click', () => {
  modal.style.opacity = '0';
  setTimeout(() => { modal.style.display = 'none'; }, 300);
});

// Fun space facts array
const spaceFacts = [
  "Did you know? One day on Venus is longer than one year on Venus!",
  "Did you know? There are more stars in the universe than grains of sand on Earth.",
  "Did you know? Neutron stars can spin 600 times per second.",
  "Did you know? The footprints on the Moon will be there for millions of years.",
  "Did you know? Jupiter's Great Red Spot is a storm bigger than Earth.",
  "Did you know? A day on Mercury is 59 Earth days long.",
  "Did you know? The Sun accounts for 99.8% of the mass in our solar system.",
  "Did you know? The Moon is slowly drifting away from Earth—about 1.5 inches per year.",
  "Did you know? It rains diamonds on Jupiter and Saturn.",
  "Did you know? The hottest planet in our solar system is Venus, not Mercury!"
];

// Show a random space fact in the element with id 'spaceFact'
function showRandomFact() {
  const factBox = document.getElementById('spaceFact');
  const randomIndex = Math.floor(Math.random() * spaceFacts.length);
  factBox.textContent = spaceFacts[randomIndex];
  // Center the space fact on the page
  factBox.style.display = 'block';
  factBox.style.textAlign = 'center';
  factBox.style.margin = '30px auto 0 auto';
  factBox.style.fontSize = '1.2em';
}

showRandomFact();


