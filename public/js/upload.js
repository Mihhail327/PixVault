const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const uploadLink = document.getElementById('upload-link');
const status = document.getElementById('status');
const imageList = document.getElementById('image-list');

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.querySelector('.drop-label').style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
});

dropZone.addEventListener('dragleave', () => {
  dropZone.querySelector('.drop-label').style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.querySelector('.drop-label').style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
  const file = e.dataTransfer.files[0];
  if (file) {
    fileInput.files = e.dataTransfer.files;
    handleUpload(file);
  }
});

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  handleUpload(file);
});

function handleUpload(file) {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
  const maxSize = 5 * 1024 * 1024;

  // Reset animations
  uploadLink.classList.remove('link-appear');
  status.classList.remove('status-animate');

  if (!validTypes.includes(file.type)) {
    status.textContent = 'Upload failed: Unsupported file type';
    status.className = 'status error status-animate';
    uploadLink.value = '';
    return;
  }

  if (file.size > maxSize) {
    status.textContent = 'Upload failed: File too large';
    status.className = 'status error status-animate';
    uploadLink.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const fakeLink = 'https://shorturl.at/' + Math.random().toString(36).substring(7);
    uploadLink.value = fakeLink;
    uploadLink.classList.add('link-appear');
    status.textContent = 'Upload success';
    status.className = 'status success status-animate';

    const row = document.createElement('tr');
    row.classList.add('row-appear');
    row.innerHTML = `
      <td>${file.name}</td>
      <td><a href="${fakeLink}" target="_blank">${fakeLink}</a></td>
      <td onclick="this.parentElement.remove()">🗑️</td>
    `;
    imageList.appendChild(row);
  };
  reader.readAsDataURL(file);
}

function copyLink() {
  navigator.clipboard.writeText(uploadLink.value).then(() => {
    const icon = document.querySelector('.copy-icon');
    icon.classList.add('copied');
    icon.textContent = '✅';
    setTimeout(() => {
      icon.classList.remove('copied');
      icon.textContent = 'Copy📋';
    }, 1000);
  });
}

function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });

  document.getElementById('upload-tab').style.display = tab === 'upload' ? 'block' : 'none';
  document.getElementById('images-tab').style.display = tab === 'images' ? 'block' : 'none';
}