export const downloadFolderProcess = async (gitRepoUrl) => {
    console.log(gitRepoUrl, 'fettttsss');
    const URL_PARAMS = new URLSearchParams(window.location.search);
    const TOKEN = URL_PARAMS.get('token');
    const url = new URL(gitRepoUrl.value);
    const pathname = url.pathname;
    const pathParts = pathname.split('/');
    const username = pathParts[1];
    const repo = pathParts[2];

    const folderPath = pathParts.slice(5).join('/');
    const apiUrl = `https://api.github.com/repos/${username}/${repo}/contents/${folderPath}`;
    // console.debug(apiUrl);
    const response = await fetch(apiUrl, {
        headers: {
            Authorization: `Bearer ${TOKEN}`,
            'Content-Type': 'application/json'
        }
    });
   
    const data = await response.json();

    const zip = new JSZip();
    const folder = zip.folder(repo);
    const files = [];
    for (const file of data) {
        if (file.type === 'file') {
            const fileUrl = file.download_url;
            const fileResponse = await fetch(fileUrl);
            const fileData = await fileResponse.blob();
            const fileName = file.name;
            files.push({ fileName, fileData });
        }
    }
    for (const file of files) {
        folder.file(file.fileName, file.fileData);
    }
    const content = await zip.generateAsync({ type: 'blob' });
    const blobUrl = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `${repo}-${folderPath.split('/').pop()}.zip`;
    link.click();
    link.remove();
    URL.revokeObjectURL(blobUrl);
    return;
};