import { linguagens } from './linguagens.js';
import { notas } from './icones.js';

function adicionarPaginas() {
	const nav = document.getElementById('navigation');
	const lista = document.createElement('ul');

	const indice = document.createElement('li');
	const indiceLink = document.createElement('a');
	indiceLink.text = 'Página principal';
	indiceLink.href = `/Languages/`;
	indice.appendChild(indiceLink);
	lista.appendChild(indice);

	const caminho = decodeURIComponent(window.location.pathname);
	let paginaAtual;

	if (caminho === '/Languages/') {
		indiceLink.classList.add('selecionado');
		paginaAtual = indiceLink;
	}

	for (let pagina of linguagens) {
		const elemento = document.createElement('li');
		const link = document.createElement('a');
		link.textContent = pagina.nomeExibido;
		link.href = `/Languages/${pagina.pasta}/regras`;

		const sublista = document.createElement('ul');
		for (let subpagina of pagina.subpaginas) {
			const subelemento = document.createElement('li');
			const sublink = document.createElement('a');

			sublink.text = subpagina.nomeExibido;
			sublink.href = `/Languages/${pagina.pasta}/${subpagina.pagina}`;

			subelemento.appendChild(sublink);
			sublista.appendChild(subelemento);

			if (caminho === `/Languages/${pagina.pasta}/${subpagina.pagina}`) {
				sublink.classList.add('selecionado');
				paginaAtual = sublink;
			}
		}

		elemento.appendChild(link);
		elemento.appendChild(sublista);
		lista.appendChild(elemento);
	}

	nav.appendChild(lista);
	paginaAtual.scrollIntoView();
}

function adicionarNotas() {
	const elementosNotas = [...document.querySelectorAll('blockquote>p')]
		.filter(nota => nota.innerHTML.startsWith('[!'));

	const tiposNotas = {
		note: 'Nota',
		tip: 'Dica',
		important: 'Importante',
		warning: 'Aviso',
		caution: 'Cuidado',
	};

	for (let nota of elementosNotas) {
		const textoElemento = nota.innerHTML;

		const regex = /\[!(.*?)\]\n(.*)/;
		const correspondencias = textoElemento.match(regex);

		const tipo = correspondencias[1].toLowerCase();
		const textoNota = correspondencias[2].trim();

		nota.innerHTML = `${notas[tipo]}${tiposNotas[tipo].toUpperCase()}`;

		const elementoTexto = document.createElement('p');
		elementoTexto.innerHTML = textoNota;
		nota.parentNode.appendChild(elementoTexto);
		nota.parentNode.classList.add('alert', tipo);
	}
}

window.onload = function () {
	adicionarPaginas();
	adicionarNotas();
}