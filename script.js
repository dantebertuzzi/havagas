const toggleMenuBtn = document.querySelector(".toggle-menu");
const sidebar = document.querySelector(".sidebar");
const content = document.querySelector(".content");

let activeCity = '';

function jobMatchesCity(job) {
    if (!activeCity) return true;
    const location = (job.dataset.location || '').toUpperCase();
    if (activeCity === 'OUTRAS') {
        return location.indexOf('PETROLINA') !== 0 && location.indexOf('JUAZEIRO') !== 0;
    }
    return location.indexOf(activeCity) === 0;
}

function jobMatchesText(job, filterText) {
    if (!filterText) return true;
    const title = job.querySelector('h3');
    const meta = job.querySelector('.job-meta');
    const desc = job.querySelector('.job-desc');
    const haystack = [title, meta, desc]
        .filter(Boolean)
        .map(el => el.innerText.toUpperCase())
        .join(' ');
    return haystack.indexOf(filterText) > -1;
}

function pesquisarVagas() {
    const filterText = document.getElementById('searchInput').value.toUpperCase();
    const jobs = document.getElementsByClassName('job');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const noFilterActive = filterText === '' && activeCity === '';

    for (let i = 0; i < jobs.length; i++) {
        const job = jobs[i];
        if (noFilterActive) {
            job.style.display = i < 12 ? 'block' : 'none';
            continue;
        }
        const matches = jobMatchesText(job, filterText) && jobMatchesCity(job);
        job.style.display = matches ? '' : 'none';
    }

    if (loadMoreBtn) {
        loadMoreBtn.style.display = (noFilterActive && jobs.length > 12) ? 'block' : 'none';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.city-chip').forEach(function(chip) {
        chip.addEventListener('click', function() {
            document.querySelectorAll('.city-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            activeCity = (chip.dataset.city || '').toUpperCase();
            pesquisarVagas();
        });
    });
});

toggleMenuBtn && toggleMenuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("active"), content.classList.toggle("active")
}), document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll(".job-listings .job").forEach(function(e) {
        e.addEventListener("contextmenu", function(e) {
            e.preventDefault()
        })
    }), document.addEventListener("copy", function(t) {
        var e = document.querySelectorAll(".job-listings .job");
        Array.from(e).some(function(e) {
            return e.contains(t.target)
        }) && (t.preventDefault(), alert("Copying is not allowed."))
    })
});
