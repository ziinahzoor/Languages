import { linguagens } from './linguagens.js';
import { notas } from './icones.js';

function aoRolar() {
	handleElementoExibido();
}

function adicionarPaginas() {
	const nav = document.getElementById('navigation');
	const lista = document.createElement('ul');

	const indice = document.createElement('li');
	const indiceLink = document.createElement('a');
	indiceLink.text = 'Página principal';
	indiceLink.href = `/Languages/`;
	indice.appendChild(indiceLink);
	lista.appendChild(indice);

	const caminho = decodeURIComponent(window.location.pathname.split('.html')[0]);
	let paginaAtual;

	if (caminho === '/Languages/') {
		indiceLink.classList.add('selecionado');
		paginaAtual = indiceLink;
	}

	for (let pagina of linguagens) {
		const elemento = document.createElement('li');
		const menu = document.createElement('details');
		const tituloMenu = document.createElement('summary');

		tituloMenu.textContent = pagina.nomeExibido;
		menu.appendChild(tituloMenu);

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
				menu.open = true;
				menu.classList.add('selecionado');
				paginaAtual = sublink;
			}
		}

		elemento.appendChild(menu);
		menu.appendChild(sublista);
		lista.appendChild(elemento);
	}

	nav.appendChild(lista);
	if (paginaAtual) {
		paginaAtual.scrollIntoView({ block: 'center', inline: 'center' });
	}
}

function adicionarCabecalhos() {
	let indice = 0;
	const nav = document.getElementById('header-navigation');
	const lista = document.createElement('ul');

	const cabecalhos = document.querySelectorAll('section h1,h2,h3,h4,h5,h6');

	let listaAtual = lista;
	let ultimoAninhamento = 0;

	for (let cabecalho of cabecalhos) {
		cabecalho.id = `header-${indice}`;

		const aninhamento = parseInt(cabecalho.tagName[1]);

		if (ultimoAninhamento && ultimoAninhamento != aninhamento) {
			if (aninhamento > ultimoAninhamento) {
				const itemLista = document.createElement('li');
				const listaAninhada = document.createElement('ul');

				itemLista.appendChild(listaAninhada)
				listaAtual.appendChild(itemLista);
				listaAtual = listaAninhada;
			}
		}

		const item = document.createElement('li');
		const link = document.createElement('a');

		link.innerHTML = cabecalho.innerHTML;
		link.href = `#${cabecalho.id}`;
		link.addEventListener('click', function (e) {
			window.onscroll = null;
			cabecalhoSelecionado = null;
			e.preventDefault();
			cabecalho.scrollIntoView({ behavior: 'smooth' });
			history.pushState({}, '', `#${cabecalho.id}`);

			document.getElementsByClassName('cabecalho-selecionado')[0]?.classList.remove('cabecalho-selecionado');
			link.classList.add('cabecalho-selecionado');
		});
		link.id = `header-nav-${indice++}`;

		item.appendChild(link);
		listaAtual.appendChild(item);

		ultimoAninhamento = aninhamento;
	}

	nav.appendChild(lista);
	nav.querySelector('li').classList.add('cabecalho-selecionado');
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
	adicionarCabecalhos();
	handleElementoExibido();
	window.onscroll = aoRolar;
}

let cabecalhoSelecionado;

function handleElementoExibido() {
	var elementos = [...document.querySelectorAll('section h1,h2,h3,h4,h5,h6')];
	var meioDaTela = window.innerHeight / 2;

	const elementosFiltrados = elementos.filter(e => e.getBoundingClientRect().bottom <= meioDaTela);
	const elementoExibido = elementosFiltrados.reduce(function (res, obj) {
		let condicao;
		const limiteRes = res.getBoundingClientRect().bottom;
		const limiteObj = obj.getBoundingClientRect().bottom;
		const limiarTopo = 75;

		if (window.scrollY < limiarTopo) {
			condicao = limiteRes >= limiteObj;
		}
		else {
			condicao = limiteRes < limiteObj;
		}

		return condicao ? obj : res;
	});

	if (elementoExibido) {
		const id = elementoExibido.id.slice(-1);
		document.getElementsByClassName('cabecalho-selecionado')[0]?.classList.remove('cabecalho-selecionado');

		cabecalhoSelecionado = document.getElementById(`header-nav-${id}`);
		cabecalhoSelecionado?.classList.add('cabecalho-selecionado');
	}
}

window.onscrollend = function () {
	cabecalhoSelecionado?.scrollIntoView({ behavior: 'smooth' });
	cabecalhoSelecionado = null;

	if (!window.onscroll) {
		window.onscroll = aoRolar;
	}
}
