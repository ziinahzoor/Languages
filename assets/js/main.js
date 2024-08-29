import { languages } from './languages.js';
import { alerts } from './icons.js';

function onScroll() {
	handleShownElement();

	const scrollToTopElement = document.getElementById('scroll-to-top');

	scrollToTopElement.style.display = window.scrollY === 0
		? 'none'
		: 'flex';
}

function createPage(name, path) {
	const page = document.createElement('li');
	const link = document.createElement('a');
	link.text = name;
	link.href = path;
	page.appendChild(link);
	return page;
}

function addPages() {
	const nav = document.getElementById('navigation');
	const list = document.createElement('ul');
	const mainPage = createPage('Página inicial', '/Languages/');
	const grammarPage = createPage('Gramática', '/Languages/gramática');
	const ipaPage = createPage('AFI (IPA)', '/Languages/ipa');
	const testsPage = createPage('Provas', '/Languages/provas');
	const utilsPage = createPage('Úteis', '/Languages/utils');

	[mainPage, grammarPage, ipaPage, testsPage, utilsPage].forEach(p => list.appendChild(p));

	const path = decodeURIComponent(window.location.pathname.split('.html')[0]);
	let currentPage;

	[mainPage, grammarPage, ipaPage, testsPage, utilsPage].forEach(p => {
		const anchor = p.querySelector('a');

		if (encodeURI(path) === anchor.pathname) {
			anchor.classList.add('selected-page');
			currentPage = anchor;
		}
	});

	for (let page of languages) {
		const element = document.createElement('li');
		const menu = document.createElement('details');
		const menuTitle = document.createElement('summary');

		menuTitle.textContent = page.displayName;
		menu.appendChild(menuTitle);

		const sublist = document.createElement('ul');
		for (let subpage of page.subpages) {
			const subelement = document.createElement('li');
			const sublink = document.createElement('a');

			sublink.text = subpage.displayName;
			sublink.href = `/Languages/${page.folder}/${subpage.page}`;

			subelement.appendChild(sublink);
			sublist.appendChild(subelement);

			if (path === `/Languages/${page.folder}/${subpage.page}`) {
				sublink.classList.add('selected-page');
				menu.open = true;
				menu.classList.add('selected-page');
				currentPage = sublink;
			}
		}

		element.appendChild(menu);
		menu.appendChild(sublist);
		list.appendChild(element);
	}

	nav.appendChild(list);
	if (currentPage) {
		currentPage.scrollIntoView({ block: 'center', inline: 'center' });
	}
}

function addHeaders() {
	let index = 0;
	const nav = document.getElementById('header-navigation');
	const list = document.createElement('ul');

	const headers = document.querySelectorAll('section h1,h2,h3,h4,h5,h6');

	if (!headers.length) {
		nav.parentElement.removeChild(nav);
		return;
	}

	let currentList = list;
	let lastNesting = 0;

	for (let header of headers) {
		const id = header.id;

		header.id = id.startsWith('var_')
			? id.slice(4)
			: `header-${index}`;

		const nesting = parseInt(header.tagName[1]);

		if (lastNesting && lastNesting != nesting) {
			let currentNesting = nesting;
			if (nesting > lastNesting) {
				while (currentNesting > lastNesting) {
					const listItem = document.createElement('li');
					const nestedList = document.createElement('ul');

					listItem.appendChild(nestedList)
					currentList.appendChild(listItem);
					currentList = nestedList;
					currentNesting--;
				}
			}
			else {
				while (currentNesting < lastNesting) {
					currentList = currentList.parentElement.parentElement;
					currentNesting++;
				}
			}
		}

		const item = document.createElement('li');
		const link = document.createElement('a');

		link.innerHTML = header.innerHTML;
		link.href = `#${header.id}`;
		link.addEventListener('click', function (e) {
			window.onscroll = null;
			selectedHeader = null;
			e.preventDefault();
			header.scrollIntoView({ behavior: 'smooth' });
			history.pushState({}, '', `#${header.id}`);

			document.getElementsByClassName('selected-header')[0]?.classList.remove('selected-header');
			link.classList.add('selected-header');
		});
		link.id = `header-nav-${id.startsWith('var_') ? header.id : index++}`;

		item.appendChild(link);
		currentList.appendChild(item);

		lastNesting = nesting;
	}

	nav.appendChild(list);
	nav.querySelector('li').classList.add('selected-header');
}

function addAlerts() {
	const alertElements = [...document.querySelectorAll('blockquote')]
		.filter(blockquote => blockquote.querySelector(':scope>p').innerHTML.startsWith('[!'));

	const alertTypes = {
		note: 'Nota',
		tip: 'Dica',
		important: 'Importante',
		warning: 'Aviso',
		caution: 'Atenção',
	};

	for (let alert of alertElements) {
		const alertHead = alert.querySelector(':scope>p');
		const alertBodyElements = [...alert.querySelectorAll(':scope>*:not(:first-child)')];

		const regex = /\[!(.*?)\](.*)/s;
		const matches = alertHead.innerHTML.match(regex);

		const matchType = matches[1].toLowerCase();
		alert.innerHTML = `<p>${alerts[matchType]}${alertTypes[matchType].toUpperCase()}</p>`;

		const bodyElement = document.createElement('div');
		const bodyText = matches[2]?.trim().replace(/<\/p>(?!.*<\/p>)/, '') ?? '';
		for (let paragraph of bodyText.split('\n').filter(p => p)) {
			const paragraphElement = document.createElement('p');
			paragraphElement.innerHTML = paragraph;

			bodyElement.appendChild(paragraphElement);
		}

		for (let element of alertBodyElements) {
			bodyElement.appendChild(element);
		}

		alert.appendChild(bodyElement);
		alert.classList.add('alert', matchType);
	}
}

window.onload = function () {
	addPages();
	addAlerts();
	addHeaders();
	addScrollToTop();
	handleShownElement();
	window.onscroll = onScroll;
}

let selectedHeader;

function handleShownElement() {
	var elements = [...document.querySelectorAll('section h1,h2,h3,h4,h5,h6')];

	if (!elements.length) {
		return;
	}

	var screenMiddlePoint = window.innerHeight / 2;

	const filteredElements = elements.filter(e => e.getBoundingClientRect().bottom <= screenMiddlePoint);
	const shownElement = filteredElements.reduce(function (res, obj) {
		let condition;
		const resThreshold = res.getBoundingClientRect().bottom;
		const objThreshold = obj.getBoundingClientRect().bottom;
		const topThreshold = 75;

		if (window.scrollY < topThreshold) {
			condition = resThreshold >= objThreshold;
		}
		else {
			condition = resThreshold < objThreshold;
		}

		return condition ? obj : res;
	});

	if (shownElement) {
		const id = shownElement.id.startsWith('header')
			? shownElement.id.split('-')[1]
			: shownElement.id;

		document.getElementsByClassName('selected-header')[0]?.classList.remove('selected-header');

		selectedHeader = document.getElementById(`header-nav-${id}`);
		selectedHeader?.classList.add('selected-header');
	}
}

function addScrollToTop() {
	const button = document.createElement('button');
	button.innerHTML = '▲';
	button.id = 'scroll-to-top';
	button.style.position = 'fixed';
	button.style.bottom = '20px';
	button.style.right = '20px';
	button.style.padding = '15px 15px';
	button.style.backgroundColor = '#121821';
	button.style.color = '#ea00d9';
	button.style.border = 'solid 1px #ea00d9';
	button.style.borderRadius = '25%';
	button.style.cursor = 'pointer';
	button.style.boxShadow = '-2px 2px #0abdc6';
	button.style.fontFamily = 'Arvo';
	button.style.fontSize = '1.2rem'

	button.addEventListener('click', () => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	});

	button.addEventListener('mouseover', () => {
		button.style.backgroundColor = '#0d1111';
	});

	button.addEventListener('mouseout', () => {
		button.style.backgroundColor = '#121821';
	});

	document.body.appendChild(button);
}

window.onscrollend = function () {
	selectedHeader?.scrollIntoView({ behavior: 'smooth' });
	selectedHeader = null;

	if (!window.onscroll) {
		window.onscroll = onScroll;
	}
}

