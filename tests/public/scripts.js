document.addEventListener("DOMContentLoaded", function() {
    // Toggling Sidebar
    document.getElementById("toggleBtn").addEventListener("click", function () {
        var sidebar = document.getElementById("sidebar");
        var main = document.getElementById("main");

        if (sidebar.style.width === "200px") {
            sidebar.style.width = "0";
            main.style.marginLeft = "0";
        } else {
            sidebar.style.width = "200px";
            main.style.marginLeft = "200px";
        }
    });

    // Event listeners for buttons and links
    const academyButton = document.getElementById('academyButton');
    const homeButton = document.getElementById('homeButton');
    const studentsButton = document.getElementById('studentsButton');
    const tutorsButton = document.getElementById('tutorsButton');
    const coursesButton = document.getElementById('coursesButton');

    if (academyButton) {
        academyButton.addEventListener('click', function () {
            window.location.href = 'academy.html';
        });
    }

    if (homeButton) {
        homeButton.addEventListener('click', function () {
            window.location.href = 'index.html';
        });
    }

    if (studentsButton) {
        studentsButton.addEventListener('click', function () {
            window.location.href = 'students.html';
        });
    }

    if (tutorsButton) {
        tutorsButton.addEventListener('click', function () {
            window.location.href = 'tutors.html';
        });
    }

    if (coursesButton) {
        coursesButton.addEventListener('click', function () {
            window.location.href = 'courses.html';
        });
    }
});
document.getElementById("toggleBtn").addEventListener("click", function () {
    var sidebar = document.getElementById("sidebar");
    if (sidebar.style.display === "block") {
        sidebar.style.display = "none";
    } else {
        sidebar.style.display = "block";
    }
});
