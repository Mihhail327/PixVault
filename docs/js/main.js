const images = [
    'assets/gallery/image2.jpg',
    'assets/gallery/image3.jpg',
    'assets/gallery/image4.jpg',
    'assets/gallery/image5.jpg'
];

let index = 0;
const holo = document.querySelector('.holo-content');

function showNextImage() {
    holo.style.backgroundImage = `url(${images[index]})`;
    index = (index + 1) % images.length;
}

showNextImage();

setInterval(showNextImage, 4000);