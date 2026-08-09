---
permalink: /entries.js
---
// entries.js
// Dados das vagas em _vagas/*.md (collection) — este arquivo é gerado pelo Jekyll a partir dela.

const entries = [
{% assign sorted_vagas = site.vagas | sort: "order" %}{% for e in sorted_vagas %}    {
        id: '{{ e.job_id }}',
        title: '{{ e.title | replace: "'", "\'" }}',
        enterprise: '{{ e.enterprise | replace: "'", "\'" }}',
        location: '{{ e.location | replace: "'", "\'" }}',
        description: '{{ e.description | replace: "'", "\'" }}',
{% if e.email %}        email: '{{ e.email | replace: "'", "\'" }}',
{% endif %}{% if e.phone %}        phone: '{{ e.phone }}',
{% endif %}        startDate: '{{ e.startDate }}',
        endDate: '{{ e.endDate }}'
    }{% unless forloop.last %},{% endunless %}

{% endfor %}];

const jobCache = {};

function disableInput(input) {
    if (input) {
        input.disabled = true;
        input.style.userSelect = 'none';
        input.style.pointerEvents = 'none';
    }
}

function preventCopy(input) {
    if (input) {
        input.addEventListener('keydown', function(event) {
            if (event.ctrlKey && event.key === 'c') {
                event.preventDefault();
            }
        });
    }
}

function updateTimer(jobId, startDate, endDate) {
    if (!jobCache[jobId]) {
        const job = document.getElementById(jobId);
        const timerDiv = job.querySelector('.timer');
        const expiredMessage = job.querySelector('.expired-message');
        const emailInput = job.querySelector('.email input');
        const phoneInput = job.querySelector('.phone input');

        jobCache[jobId] = {
            job,
            timerDiv,
            expiredMessage,
            emailInput,
            phoneInput,
            start: new Date(startDate),
            end: new Date(endDate),
            interval: null
        };

        preventCopy(emailInput);
        preventCopy(phoneInput);
    }

    const { job, timerDiv, expiredMessage, emailInput, phoneInput, start, end, interval } = jobCache[jobId];
    const now = new Date();
    const remainingTime = end - now;

    if (remainingTime <= 0) {
        clearInterval(interval);
        job.classList.add('expired');
        expiredMessage.style.display = 'block';
        timerDiv.style.display = 'none';

        disableInput(emailInput);
        disableInput(phoneInput);

        const inputs = [emailInput, phoneInput];
        inputs.forEach(input => {
            if (input) {
                input.style.filter = 'blur(5px)';
                const tooltips = job.querySelectorAll('.tooltip');
                tooltips.forEach(tooltip => tooltip.style.pointerEvents = 'none');
            }
        });
    } else {
        const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

        timerDiv.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        const timeSinceStart = now - start;
        if (timeSinceStart <= 12 * 60 * 60 * 1000) {
            job.classList.add('new');
        } else {
            job.classList.remove('new');
        }
    }

    if (!interval) {
        jobCache[jobId].interval = setInterval(() => updateTimer(jobId, startDate, endDate), 1000);
    }
}

function initJobListings(entries) {
    entries.forEach(entry => {
        const jobListing = document.getElementById(entry.id);
        if (!jobListing) return;

        if (entry.phone) {
            jobListing.insertAdjacentHTML('beforeend', `<div class="phone" style="display: none;"><input type="text" id="phoneInput" value="${entry.phone}" readonly></div>`);
        }
        if (entry.email) {
            jobListing.insertAdjacentHTML('beforeend', `<div class="email" style="display: none;"><input type="text" id="emailInput" value="${entry.email}" readonly></div>`);
        }

        const button = jobListing.querySelector('.button');
        if (button) {
            button.addEventListener('click', () => {
                if (entry.phone) {
                    exibirWhatsApp(entry.id);
                } else if (entry.email) {
                    exibirEmail(entry.id);
                }
            });
        }

        const phoneInput = jobListing.querySelector('#phoneInput');
        if (phoneInput) {
            phoneInput.addEventListener('click', () => openWhatsApp(phoneInput.value));
        }

        const emailInput = jobListing.querySelector('.email input');
        if (emailInput) {
            emailInput.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(emailInput.value);
                    const tooltip = jobListing.querySelector('.tooltip');
                    tooltip.style.display = 'block';
                    setTimeout(() => tooltip.style.display = 'none', 3000);
                } catch (err) {
                    console.error('Falha ao copiar o texto: ', err);
                }
            });
        }

        jobListing.timerInterval = setInterval(() => updateTimer(entry.id, entry.startDate, entry.endDate), 1000);
    });
}

function exibirEmail(jobId) {
    const job = document.getElementById(jobId);
    const emailDiv = job.querySelector('.email');
    emailDiv.style.display = emailDiv.style.display === "block" ? "none" : "block";
}

function exibirWhatsApp(jobId) {
    const job = document.getElementById(jobId);
    const phoneDiv = job.querySelector('.phone');
    phoneDiv.style.display = phoneDiv.style.display === 'none' ? 'block' : 'none';
}

function openWhatsApp(phoneNumber) {
    window.open('https://wa.me/' + phoneNumber, '_blank');
}

document.addEventListener('DOMContentLoaded', () => {
    initJobListings(entries);
});
