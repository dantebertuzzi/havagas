const toggleMenuBtn = document.querySelector('.toggle-menu');
const sidebar = document.querySelector('.sidebar');
const content = document.querySelector('.content');

toggleMenuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    content.classList.toggle('active');
});

// Função de pesquisar
function pesquisarVagas() {
    var input, filter, jobs, job, title, subtitle, text, i;
    input = document.getElementById("searchInput");
    filter = input.value.toUpperCase();
    jobs = document.getElementsByClassName("job");

    // Verifica se o campo de pesquisa está vazio
    if (filter === "") {
        // Se estiver vazio, redefine a visibilidade para o estado inicial (apenas 12 jobs exibidos)
        for (i = 0; i < jobs.length; i++) {
            jobs[i].style.display = i < 12 ? "block" : "none";
        }
        // Atualiza o botão "Exibir mais" conforme necessário
        document.getElementById('loadMoreBtn').style.display = jobs.length > 12 ? 'block' : 'none';
    } else {
        // Se não estiver vazio, realiza a pesquisa como antes
        for (i = 0; i < jobs.length; i++) {
            job = jobs[i];
            title = job.getElementsByTagName("h3")[0].innerText.toUpperCase();
            subtitle = job.getElementsByTagName("h5")[0].innerText.toUpperCase();
            text = job.getElementsByTagName("p")[0].innerText.toUpperCase();
            if (title.indexOf(filter) > -1 || subtitle.indexOf(filter) > -1 || text.indexOf(filter) > -1) {
                job.style.display = "";
            } else {
                job.style.display = "none";
            }
        }
    }
}

// Função para proteger de copy
document.addEventListener('DOMContentLoaded', function() {
    // Disable right-click context menu on job listings
    document.querySelectorAll('.job-listings .job').forEach(function(job) {
        job.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });
    });

    // Prevent Ctrl+C from copying job listings content
    document.addEventListener('copy', function(e) {
        var jobListings = document.querySelectorAll('.job-listings .job');
        var isJobListing = Array.from(jobListings).some(function(job) {
            return job.contains(e.target);
        });

        if (isJobListing) {
            e.preventDefault();
            alert('Copying is not allowed.');
        }
    });
});
