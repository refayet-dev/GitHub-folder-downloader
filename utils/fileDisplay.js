import { downloadFolder } from './downloadFolder.js';
const fileOutput = document.querySelector('.fileOutput');
const input = document.querySelector('form input');

// Function to display the contents of a repository
export const fileDisplay = async (repoUrl) => {
    try {
        const url = new URL(repoUrl);
        const pathname = url.pathname;
        console.log(pathname);
        const pathParts = pathname.split('/');

        const username = pathParts[1];
        const repo = pathParts[2];
        const folderPath = pathParts.slice(5).join('/');
        // console.log(folderPath)

        // GitHub API URL to get the contents of a repository
        const apiUrl = `https://api.github.com/repos/${username}/${repo}/contents/${folderPath}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        // console.log(data);

        // Display the contents of the repository
        fileOutput.innerHTML = `<h3 class="textLineOne">Folder Contents</h3>
            <h4 class="textLineOne">Repository: ${repo}</h4>
            <h4 class="textLineOne"> ${folderPath && `Folder: ${folderPath}`} </h4>
            <h4 class="textLineOne">Total Files: ${data.length}</h4>
            ${folderPath && `<button id="backFolder" class="backFolder">Back to previous folder</button>`}
            <hr>
          <div class="table-container">
            <table class="table">
                <thead>
                <tr>
                    <th class="th-1">
                        #
                    </p>
                    </th>
                    <th class="th-2">
                    <p class="th-2-fileContent">
                        File Name
                    </p>
                    </th>
                    <th class="th-2">
                    <p class="th-2-fileContent">
                       File Type
                    </p>
                    </th>
                    <th class="th-2">
                    <p class="th-2-fileContent">
                        File Size
                    </p>
                    </th>
                    <th class="th-2">
                    <p class="th-2-fileContent"></p>
                    </th>
                </tr>
                </thead>
                <tbody>
                ${data.map(file => `
                    <tr>
                        <td class="tbody-td">
                        <p class="tbody-td-content">
                           ${data.indexOf(file) + 1}
                        </p>
                        </td>
                        <td class="tbody-td">
                        <p class="tbody-td-content">
                            ${file.name}
                        </p>
                        </td>
                        <td class="tbody-td">
                        <p class="tbody-td-content capitalize">
                            ${file.type === 'file' ? 'file' : 'folder'}
                        </p>
                        </td>
                        <td class="tbody-td">
                        <p class="tbody-td-content">
                            ${file.size === 0 ? '' : file.size > 1000000 ? `${(file.size / 1000000).toFixed(2)} MB` : `${(file.size / 1000).toFixed(2)} KB`}
                        </p>
                        </td>
                        <td class="tbody-td">
                       
                            ${file.type === 'file' ? `<a id="rawFileDownload" href="${file.download_url}" target="_blank" class="tbody-td-content-link" download>Download file</a>` : `<a id="folderDetails" href="${file._links.html}" target="_blank" class="tbody-td-content-link capitalize">see folder</a>`}
                        
                        </td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
            </div>
            <div class="downloadAll">
                <h3 class="text-center font-bold"> Total Size: ${((data.reduce((acc, file) => acc + file.size, 0)) / 1000000).toFixed(2)} MB</h3>
                <button id="gitDown" class="downloadAllButton">
                    Download as zip
                </button>
            </div>

           `;

    } catch (error) {
        alert('Invalid URL! Please enter a valid repository URL');
    }
};

// Event listener to download the entire repository as a zip file
fileOutput.addEventListener('click', async (e) => {
    if (e.target.id === 'gitDown') {
        console.log('Downloading...');
        await downloadFolder(repoUrl);
    }
});

// Event listener to display the contents of a folder
fileOutput.addEventListener('click', async (e) => {
    if (e.target.id === 'folderDetails') {
        e.preventDefault();
        const folderUrl = e.target.href;
        await fileDisplay(folderUrl);
        input.value = folderUrl;
    }
});

// Event listener to go back to the previous folder
fileOutput.addEventListener('click', async (e) => {
    if (e.target.id === 'backFolder') {
        e.preventDefault();
        const url = new URL(input.value);
        const pathname = url.pathname;
        const pathParts = pathname.split('/');
        // if pathParts.length === 5, then it is a repository not remove 
        if (pathParts.length === 5) {
            alert('You are at the root of the repository!');
            return;
        }

        const folderPath = pathParts.slice(0, -1).join('/');
        // console.log(folderPath);
        const folderUrl = `https://github.com${folderPath}`;
        await fileDisplay(folderUrl);
        input.value = folderUrl;
    }
});

// Event listener to download a raw file from the repository
fileOutput.addEventListener('click', async (e) => {
    if (e.target.id === 'rawFileDownload') {
        e.preventDefault();
        const fileUrl = e.target.href;
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileUrl.split('/').pop();
        document.body.appendChild(a);
        a.click();
        a.remove();
    }
});