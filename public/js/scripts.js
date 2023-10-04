/*!
* Start Bootstrap - Small Business v5.0.6 (https://startbootstrap.com/template/small-business)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-small-business/blob/master/LICENSE)
*/
// This file is intentionally blank
// Use this file to add JavaScript to your project

// Mostra searchbar no mobile
function showSearchMobile()
{
    var searchvid = document.getElementById("searchvideo");

    if (searchvid.style.display === "none" || searchvid.style.display === "") {
        searchvid.style.display = "block";
    } else {
        searchvid.style.display = "none";
    }
}
// Limpa a barra de pesquisa quando se muda o tipo
function clearSearchbar()
{
    document.getElementById("video_url").value = "";
}
// Invite copy to clipboard
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('copyButton').addEventListener('click', function () {
        var textToCopy = document.getElementById('textToCopy');
        textToCopy.select();
        document.execCommand('copy');
        alert('Copied to clipboard: ' + textToCopy.value);
    });
});
  