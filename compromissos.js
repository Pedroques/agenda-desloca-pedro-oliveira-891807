const tableBody = document.querySelector('.agenda-compromissos tbody');
const addBtn = document.querySelector('.agenda-btn');
const proximoCard = document.querySelector('.agenda-card');
let compromissoExtra = null;
let alertasEmitidos = {};

function carregarCompromissos() {
    const compromissos = [
        { hora: "7:30", local: "Escritório" },
        { hora: "12:00", local: "Academia" },
        { hora: "15:30", local: "Faculdade" },
        { hora: "18:00", local: "Casa" }
    ];

    tableBody.innerHTML = "";

    compromissos.forEach(item => {
        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${item.hora}</td>
            <td>${item.local}</td>
        `;
        adicionarBotoesAcao(linha);
        tableBody.appendChild(linha);
    });

    atualizarProximoDeslocamento();
}

function atualizarProximoDeslocamento() {
    const linhas = tableBody.querySelectorAll('tr');
    const agora = new Date();
    let maisProximo = null;
    let menorDiferenca = Infinity;

    linhas.forEach(linha => {
        const horaTexto = linha.children[0].innerText.trim();
        const [hora, minuto] = horaTexto.split(':').map(Number);
        const compromissoHora = new Date();
        compromissoHora.setHours(hora, minuto, 0, 0);

        const diffMin = (compromissoHora - agora) / (1000 * 60);

        if (diffMin >= 0 && diffMin < menorDiferenca) {
            menorDiferenca = diffMin;
            maisProximo = { horaTexto, diffMin };
        }
    });

    if (maisProximo) {
        proximoCard.innerHTML = `
            <p><strong>Hoje, ${maisProximo.horaTexto}</strong></p>
            <p>Saída em ${Math.round(maisProximo.diffMin)} min</p>
            <p>Notificação de lembrete definida.</p>
        `;

        const intervalos = [30, 15, 10, 5, 1];
        const horaAtual = maisProximo.horaTexto;
        const minRestantes = Math.round(maisProximo.diffMin);

        if (!alertasEmitidos[horaAtual]) {
            alertasEmitidos[horaAtual] = [];
        }

        intervalos.forEach(min => {
            if (
                minRestantes <= min &&
                !alertasEmitidos[horaAtual].includes(min)
            ) {
                alert(`Alerta: Saída em ${min} minutos para o compromisso das ${horaAtual}.`);
                alertasEmitidos[horaAtual].push(min);
            }
        });
    }
    else {
        proximoCard.innerHTML = `<p>Nenhum compromisso futuro hoje.</p>`;
        alertasEmitidos = {};
    }
}

function adicionarBotoesAcao(linha) {
    const actionCell = linha.insertCell(-1);

    const editBtn = document.createElement('button');
    editBtn.innerText = "Editar";
    editBtn.classList.add("agenda-edit");
    editBtn.onclick = () => {
        const horaCell = linha.children[0];
        const localCell = linha.children[1];

        linha.children[0].contentEditable = true;
        linha.children[1].contentEditable = true;
        linha.children[0].focus();

    };

    const delBtn = document.createElement('button');
    delBtn.innerText = "Excluir";
    delBtn.classList.add("agenda-delete");
    delBtn.onclick = () => {
        linha.remove();
        compromissoExtra = null;
        atualizarProximoDeslocamento();
    };

    actionCell.appendChild(editBtn);
    actionCell.appendChild(delBtn);
}

addBtn.addEventListener('click', () => {
    if (compromissoExtra) {
        alert("Limite atingido: Só é possível adicionar um compromisso extra no momento.");
        return;
    }

    compromissoExtra = document.createElement('tr');
    compromissoExtra.innerHTML = `
        <td contenteditable="true">00:00</td>
        <td contenteditable="true">Novo Local</td>
    `;

    adicionarBotoesAcao(compromissoExtra);
    tableBody.appendChild(compromissoExtra);
    alert("Novo compromisso adicionado! Agora edite o horário e o local para que ele funcione e seja mostrado na seção de próximo deslocamento.");
    alert("Atenção: No momento há o limite de adicionar somente um novo compromisso. Porém, você pode editar qualquer um dos que já estão na lista.");

});

document.addEventListener('DOMContentLoaded', () => {
    carregarCompromissos();
    setInterval(atualizarProximoDeslocamento, 60000);
});