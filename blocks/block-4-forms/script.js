const sound = new Audio('../../assets/helicopter-helicopter.mp3');
const helicopter = document.querySelector('input[name="gender"][value="other"]');
const genders = document.querySelectorAll('input[name="gender"]');

helicopter.addEventListener('change', () => {
    sound.play();
});

genders.forEach(radio => {
    radio.addEventListener('change', () => {
        if (radio.value !== 'other') {
            sound.pause();
            sound.currentTime = 0;
        }
    });
});