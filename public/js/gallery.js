const galleryGrid = document.getElementById('gallery-grid');

// Example images - replace with dynamic fetch later
const images = [
    {name: 'Vault Entry', url: 'assets/gallery/tunnel2.jpg'},
    {name: 'Vault Interior', url: 'assets/gallery/vault_intry.jpg'},
    {name: 'Control Room', url: 'assets/gallery/mem.jpg'}
];

images.forEach(image => {
  const card = document.createElement('div');
  card.className = 'image-card';

  const img = document.createElement('img');
  img.src = image.url;
  img.alt = image.name;
  img.onclick = () => openModal(image.url); 

  //const deleteBtn = document.createElement('button');
  //deleteBtn.className = 'delete-btn';
  //deleteBtn.innerHTML = 'Delete🗑️';
  //deleteBtn.onclick = () => card.remove();

  card.appendChild(img);
  //card.appendChild(deleteBtn);
  galleryGrid.appendChild(card);
});


const modal = document.getElementById('image-modal');
const modalImage = document.getElementById('modal-image');

function openModal(src) {
  modalImage.src = src;
  modal.style.display = 'flex';
}

function closeModal() {
  modal.style.display = 'none';
  modalImage.src = '';
}

function downloadModalImage() {
  const link = document.createElement('a');
  link.href = modalImage.src;
  link.download = 'PixVault_Image.jpg';
  link.click();
}

function shareModalImage() {
  navigator.clipboard.writeText(modalImage.src).then(() => {
    alert('Image link copied to clipboard!');
  });
}
