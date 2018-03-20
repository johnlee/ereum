

function filterTable() {
    var input, filter, table, row, name, tags, i;
    input = document.getElementById("nameFilter");
    filter = input.value.toUpperCase();
    table = document.getElementById("namesTable");
    row = table.getElementsByTagName("tr");
    for (i = 0; i < row.length; i++) {
        name = row[i].getElementsByTagName("td")[0];
        tags = row[i].getElementsByTagName("td")[1];
        if (name) {
            if (name.innerHTML.toUpperCase().indexOf(filter) > -1) {
                row[i].style.display = "";
            } else {
                if (tags) {
                    if (tags.innerHTML.toUpperCase().indexOf(filter) > -1) {
                        row[i].style.display = "";
                        continue;
                    }
                }
                row[i].style.display = "none";
            }
        }
    }
}

$(document).ready(function () {
    $.ajaxSetup({ cache: false });
    //var url = "https://k1gs3gysn1.execute-api.us-east-2.amazonaws.com/prod/habits";
    var url = "http://solidfish.com/ereum/api";
    var token;

    $("#btnLogin").click(function () {
        var password = $("#password").val();
        if (password) {
            $.ajax({
                url: url + '/checklogin',
                dataType: "json",
                contentType: "application/json;charset=utf-8",
                type: "POST",
                headers: { 'Authorize': password },
                success: function (result) {
                    if (result.status == 200) {
                        localStorage.setItem("ereum", password);
                        location.reload(true);
                    } else {
                        alert("Invalid Password");
                    }
                },
                error: function (status) {
                    alert("ERROR - unable to submit request. " + JSON.stringify(status));
                }
            });
        }
    });

    $("#btnLogout").click(function () {
        localStorage.removeItem("ereum");
        location.reload(true);
    });

    $("#tableBody").on("click", "button", function () {
        if (this.id) {
            $.ajax({
                url: url + "/" + this.id,
                dataType: "json",
                contentType: "application/json;charset=utf-8",
                type: "GET",
                headers: { 'Authorize': token },
                success: function (result) {
                    if (result[0].id) {
                        $("#fmHeader").text(result[0].fullname);
                        $("#fmId").val(result[0].id);
                        $("#fmName").val(result[0].fullname);
                        $("#fmDate").val(result[0].created);
                        $("#fmTags").val(result[0].tags);
                    }
                },
                error: function (status) {
                    alert("ERROR - unable to submit request. " + JSON.stringify(status));
                }
            });
        }
    });

    $("#btnAdd").click(function () {
        $("#fmHeader").text("New Name");
        $("#fmId").val("");
        $("#fmName").val("");
        $("#fmDate").val(dateToYMD());
        $("#fmTags").val("");
    });

    $("#btnPhoto").click(function () {
        alert("Photos not yet supported");
    });

    $("#btnSave").click(function () {
        // Date check
        var date = $("#fmDate").val();
        if (date.length != 8) {
            alert("ERROR - Invalid Date");
            return;
        }
        var content = {
            id: $("#fmId").val(),
            fullname: $("#fmName").val(),
            date: date,
            tags: $("#fmTags").val()
        };
        $.ajax({
            url: url,
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            type: "POST",
            headers: { 'Authorize': token },
            data: JSON.stringify(content),
            success: function (result) {
                location.reload(true);
            },
            error: function (status) {
                alert("ERROR - unable to submit request. " + JSON.stringify(status));
            }
        });
    });

    function dateToYMD() {
        var date = new Date();
        var d = date.getDate();
        var m = date.getMonth() + 1; //Month from 0 to 11
        var y = date.getFullYear();
        return '' + y + (m <= 9 ? '0' + m : m) + (d <= 9 ? '0' + d : d);
    }

    function loadToken() {
        if (typeof (Storage) !== "undefined") {
            token = localStorage.getItem("ereum");
            if (token) {
                document.getElementById("divLogin").style.display = 'none';
                document.getElementById("divNames").style.display = 'block';
                return true;
            } else {
                document.getElementById("divLogin").style.display = 'block';
                document.getElementById("divNames").style.display = 'none';
            }
        }
        return false;
    }

    function drawRowButton(id) {
        return `<button class="btn btn-outline-info btn-sm float-right" id="${id}" data-toggle="modal" data-target="#modal"><i class="fas fa-pencil-alt"></i></button>`;
    }

    function loadPage() {
        if (loadToken()) {
            $.ajax({
                url: url,
                dataType: "json",
                contentType: "application/json;charset=utf-8",
                type: "GET",
                headers: { 'Authorize': token },
                success: function (result) {
                    $.each(result, function (i, item) {
                        var row = `<tr><td>${item.fullname}</td><td>${item.tags}</td><td>${drawRowButton(item.id)}</td></tr>`;
                        $("#tableBody").append(row);
                    });
                },
                error: function (status) {
                    alert("ERROR - unable to submit request. " + JSON.stringify(status));
                }
            });
        }
    }

    loadPage();
});