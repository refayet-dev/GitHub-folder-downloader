import { fileDisplay } from './utils/fileDisplay.js';
const button = document.querySelector('.button');
const form = document.querySelector('.form');
let footerHeight=document.querySelector('footer').getBoundingClientRect().height;

document.body.style.setProperty('--footerHeight', `${footerHeight}px`);

button.addEventListener('click', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const gitRepoUrl = formData.get('gitRepoUrl');
    console.log(gitRepoUrl);
    if (!gitRepoUrl) {
        alert('Please enter a valid repository URL');
        return;
    }
    document.querySelector('.main-content').classList.add('hidden'); 
    document.querySelector('.fileOutput').classList.add('show');   
    await fileDisplay(gitRepoUrl);
}
);