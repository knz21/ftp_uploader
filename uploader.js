function init() {
    var pass = getPass();
    var $uploader = $('#uploader');
    var $passForm = $('#pass_form');
    if (!pass) {
        $uploader.remove();
        $passForm.removeClass('invisible');
        $('#submit').on('click', submit);
        return;
    }
    load();
    $passForm.remove();
    $uploader.removeClass('invisible');
    $('#file').on('change', handleFileSelect);
    $('#upload').on('click', upload);
}

function submit() {
    var pass = $('#pass').val() || getPass();
    $.ajax({
        type: 'POST',
        url: 'submit',
        dataType: 'text',
        data: pass
    }).done(function () {
        setPass(pass);
        location.reload();
    }).fail(function () {
        alert('error');
    });
}

function load() {
    $.ajax({
        type: 'POST',
        url: 'load',
        dataType: 'json',
        data: getPass()
    }).done(function (list) {
        if (list && list.length > 0) {
            var $ftpList = $('#ftp_list');
            list.forEach(function (file) {
                if (file.isFile) {
                    var date = new Date(file.date);
                    date.setHours(date.getHours() - 9);
                    $ftpList.append($('<li>').text(file.name + ' - ' + file.size + ' bytes, updated:' + date.toLocaleString()));
                }
            });
        }
    });
}

function handleFileSelect(e) {
    handleFile(e.target.files);
}

function handleFile(files) {
    var $fileDetail = $('#file_detail');
    $fileDetail.children().remove();
    showFileList(files, $fileDetail);
}

function showFileList(files, $fileDetail) {
    for (var i = 0, file; file = files[i]; i++) {
        showFileDetail($fileDetail, file);
        showFileImage($fileDetail, file);
    }
    toggleUploadButton(true);
}

function showFileDetail($fileDetail, file) {
    $fileDetail.append($('<p>').text(
        encodeURIComponent(file.name) + '(' + (file.type || 'n/a') + ') - ' + file.size +
        ' bytes, last modified: ' + file.lastModifiedDate.toLocaleString()
    ));
}

function showFileImage($fileDetail, file) {
    if (!file.type.match('image.*')) {
        return;
    }
    var reader = new FileReader();
    reader.onload = (function (theFile) {
        return function (e) {
            $fileDetail.append($('<img>').attr({
                class: 'thumb',
                src: e.target.result,
                title: encodeURIComponent(theFile.name)
            }));
        };
    })(file);
    reader.readAsDataURL(file);
}

var isUploading = false;

function upload() {
    var $file = $('#file');
    if (isUploading || $file.get()[0].files.length === 0) {
        return;
    }
    isUploading = true;
    toggleUploadButton(false);
    startLoading();
    var formData = new FormData();
    formData.append('file', $file.prop('files')[0]);
    formData.append('pass', getPass());
    $.ajax({
        type: 'POST',
        url: 'upload',
        dataType: 'text',
        data: formData,
        processData: false,
        contentType: false
    }).done(function () {
        location.reload();
    }).fail(function () {
        alert('error!!!');
        isUploading = false;
        toggleUploadButton(true);
        finishLoading();
    });
}

function toggleUploadButton(enabled) {
    var $upload = $('#upload');
    var classEnabled = 'button_enabled';
    var classDisabled = 'button_disabled';
    $upload.removeClass(enabled ? classDisabled : classEnabled);
    $upload.addClass(enabled ? classEnabled : classDisabled);
}

function startLoading() {
    $('#loading').removeClass('invisible');
}

function finishLoading() {
    $('#loading').addClass('invisible');
}

var KEY = 'upload_pass';

function getPass() {
    return window.localStorage.getItem(KEY);
}

function setPass(pass) {
    window.localStorage.setItem(KEY, pass);
}

(function () {
    init();
})();