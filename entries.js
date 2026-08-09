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
        const badgeEl = job.querySelector('[data-badge]');
        const emailInput = job.querySelector('.email input');
        const phoneInput = job.querySelector('.phone input');

        jobCache[jobId] = {
            job,
            timerDiv,
            expiredMessage,
            badgeEl,
            emailInput,
            phoneInput,
            start: new Date(startDate),
            end: new Date(endDate),
            interval: null
        };

        preventCopy(emailInput);
        preventCopy(phoneInput);
    }

    const { job, timerDiv, expiredMessage, badgeEl, emailInput, phoneInput, start, end, interval } = jobCache[jobId];
    const now = new Date();
    const remainingTime = end - now;
    const closingSoonThreshold = 3 * 24 * 60 * 60 * 1000;
    const newThreshold = 12 * 60 * 60 * 1000;

    if (remainingTime <= 0) {
        clearInterval(interval);
        job.classList.add('expired');
        job.classList.remove('new');
        timerDiv.style.display = 'none';

        if (badgeEl) {
            badgeEl.textContent = 'Encerrada';
            badgeEl.className = 'job-badge job-badge--expired';
        }

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
        const isNew = timeSinceStart <= newThreshold;
        job.classList.toggle('new', isNew);

        if (badgeEl) {
            if (remainingTime <= closingSoonThreshold) {
                badgeEl.textContent = `Encerra em ${days}d`;
                badgeEl.className = 'job-badge job-badge--closing-soon';
            } else if (isNew) {
                badgeEl.textContent = 'Nova';
                badgeEl.className = 'job-badge job-badge--new';
            } else {
                badgeEl.textContent = '';
                badgeEl.className = 'job-badge';
            }
        }
    }

    if (!interval) {
        jobCache[jobId].interval = setInterval(() => updateTimer(jobId, startDate, endDate), 1000);
    }
}

const whatsappIconSvg = '<svg class="contact-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/></svg>';

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

        const contactLabel = jobListing.querySelector('[data-contact-label]');
        if (contactLabel) {
            if (entry.phone) {
                contactLabel.innerHTML = whatsappIconSvg + ' Ver telefone';
            } else if (entry.email) {
                contactLabel.innerHTML = '<span class="material-symbols-outlined">mail</span> Ver email';
            }
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
