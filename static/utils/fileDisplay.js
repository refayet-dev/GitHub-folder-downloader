import { downloadFolderProcess } from "./downloadFolderProcess.js";
const fileOutput = document.querySelector(".fileOutput");
const input = document.querySelector("form input");

export const fileDisplay = async (gitRepoUrl) => {
  try {
    const URL_PARAMS = new URLSearchParams(window.location.search);
    const TOKEN = URL_PARAMS.get("token");
    const encodedAccessToken = encodeURIComponent(TOKEN);
    const headers = {
      Authorization: `Bearer ${encodedAccessToken}`,
    };
    const url = new URL(gitRepoUrl);
    const pathname = url.pathname;
    const pathParts = pathname.split("/");
    const username = pathParts[1];
    const repo = pathParts[2];
    const folderPath = pathParts.slice(5).join("/");
    const apiUrl = `https://api.github.com/repos/${username}/${repo}/contents/${folderPath}`;
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `token ${encodedAccessToken}`,
        ...headers,
      },
    });

    const rateLimitLimit = response.headers.get("X-RateLimit-Limit");
    const rateLimitRemaining = response.headers.get("X-RateLimit-Remaining");
    const rateLimitReset = response.headers.get("X-RateLimit-Reset");
    console.log(`Rate Limit Limit: ${rateLimitLimit}`);
    console.log(`Rate Limit Remaining: ${rateLimitRemaining}`);
    console.log(`Rate Limit Reset: ${rateLimitReset}`);
    const data = response.data;
    let content = `
        <div class='fileOutputContainer'>
                <div class='fileOutputHeader'>
                        <div class="text-content-container">
                            <h2 class="textContent">Folder Contents</h2>
                            <h2 class="textContent">Repository: ${repo}</h2>
                            <h2 class="textContent"> ${
                              folderPath && `Folder: ${folderPath}`
                            } </h2>
                            <h2 class="textContent">Total Files: ${
                              data.length
                            }</h2>
                        </div>
                        <div class="backButton-container">
                                ${
                                  folderPath &&
                                  `<button id="backFolder" class="backFolder">Go Back</button>`
                                }
                        </div>
                </div>
                <div class="table-content-container">
                        <div class="table-container">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th class="th-1">
                                            <p>
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
                                    ${data
                                      .map(
                                        (file) => `
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
                                                ${
                                                  file.type === "file"
                                                    ? "File"
                                                    : "Folder"
                                                }
                                            </p>
                                        </td>
                                        <td class="tbody-td">
                                            <p class="tbody-td-content">
                                                ${
                                                  file.size === 0
                                                    ? ""
                                                    : file.size > 1000000
                                                    ? `${(
                                                        file.size / 1000000
                                                      ).toFixed(2)} MB`
                                                    : `${(
                                                        file.size / 1000
                                                      ).toFixed(2)} KB`
                                                }
                                            </p>
                                        </td>
                                        <td class="tbody-td">
                                            ${
                                              file.type === "file"
                                                ? `<a id="rawFileDownload" href="${file.download_url}" target="_blank" class="tbody-td-content-link" download>Download File</a>`
                                                : `<a id="folderDetails" href="${file._links.html}" target="_blank" class="tbody-td-content-link capitalize">See Folder</a>`
                                            }
                                        
                                        </td>
                                    </tr>
                                    `
                                      )
                                      .join("")}
                                </tbody>
                            </table>
                        </div>
                        <div class="downloadAll">
                                <h3 class="text-center font-bold"> Total Size: ${(
                                  data.reduce(
                                    (acc, file) => acc + file.size,
                                    0
                                  ) / 1000000
                                ).toFixed(2)} MB</h3>
                                <button id="gitDown" class="downloadAllButton">
                                    Download as Zip
                                </button>
                        </div>
                </div>
        </div>
        `;
    fileOutput.innerHTML = "";
    fileOutput.insertAdjacentHTML("beforeend", content);
  } catch (error) {
    console.error(`Error fetching repository: ${error}`);
    document.querySelector(".alert-container").style.display = "block";
  }
};

document.body.addEventListener("click", async (e) => {
  if (e.target.id === "gitDown") {
    await downloadFolderProcess(gitRepoUrl);
  } else if (e.target.id === "folderDetails") {
    e.preventDefault();
    const folderUrl = e.target.href;
    await fileDisplay(folderUrl);
    input.value = folderUrl;
  } else if (e.target.id === "backFolder") {
    e.preventDefault();
    const url = new URL(input.value);
    const pathname = url.pathname;
    const pathParts = pathname.split("/");
    if (pathParts.length === 5) {
      alert("You are at the root of the repository!");
      return;
    }
    const folderPath = pathParts.slice(0, -1).join("/");
    const folderUrl = `https://github.com${folderPath}`;
    await fileDisplay(folderUrl);
    input.value = folderUrl;
  } else if (e.target.id === "rawFileDownload") {
    e.preventDefault();
    const fileUrl = e.target.href;
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileUrl.split("/").pop();
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
});
