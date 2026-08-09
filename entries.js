---
permalink: /entries.js
---
// entries.js
// Dados das vagas em _data/vagas.yml — este arquivo é gerado pelo Jekyll a partir de lá.

const entries = [
{% for e in site.data.vagas %}    {
        id: '{{ e.id }}',
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

        const phoneDiv = job.querySelector('.phone');
        if (phoneDiv) {
            phoneDiv.style.display = 'none';
        }

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

const jobListingsContainer = document.querySelector('.job-listings');

function generateJobListingsWithPhoneAndEmail(entries) {
    entries.forEach(entry => {
        const jobListing = document.createElement('div');
        jobListing.classList.add('job');
        jobListing.id = entry.id;

        jobListing.innerHTML = `
        <h3 style="margin-bottom: 0.5em;">${entry.title}</h3>
        <h5 style="margin-bottom: 0.5em;">${entry.enterprise}</h5>
        <p style="margin-bottom: 0.5em;">${entry.location}</p>
        <p style="margin-bottom: 0.5em;">${entry.description}</p>
            <a href="javascript:void(0)" class="button"><span>Candidatar-se</span></a>
            ${entry.phone ? `<div class="phone" style="display: none;"><input type="text" id="phoneInput" value="${entry.phone}" readonly></div>` : ''}
            ${entry.email ? `<div class="email" style="display: none;"><input type="text" id="emailInput" value="${entry.email}" readonly></div>` : ''}
            <div class="tooltip" style="display: none;">Email copiado!</div>
            <div class="timer" data-data-inicio="${entry.startDate}" data-data-fim="${entry.endDate}"></div>
            <div class="expired-message" style="display: none;">Anúncio Expirado</div>
        `;

        jobListing.querySelector('.button').addEventListener('click', () => {
            if (entry.phone) {
                exibirWhatsApp(entry.id);
            } else if (entry.email) {
                exibirEmail(entry.id);
            }
        });

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

        jobListingsContainer.appendChild(jobListing);
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
    generateJobListingsWithPhoneAndEmail(entries);
});
