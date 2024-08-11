import { languages } from './languages.js';
import { alerts } from './icons.js';

function onScroll() {
	handleShownElement();
}

function addPages() {
	const nav = document.getElementById('navigation');
	const list = document.createElement('ul');

	const index = document.createElement('li');
	const linkIndex = document.createElement('a');
	linkIndex.text = 'Página principal';
	linkIndex.href = `/Languages/`;
	index.appendChild(linkIndex);
	list.appendChild(index);

	const path = decodeURIComponent(window.location.pathname.split('.html')[0]);
	let currentPage;

	if (path === '/Languages/') {
		linkIndex.classList.add('selected-page');
		currentPage = linkIndex;
	}

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

			if (path.replaceAll(' ', '%20') === `/Languages/${page.folder}/${subpage.page}`) {
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
		header.id = `header-${index}`;

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
		link.id = `header-nav-${index++}`;

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

		const regex = /\[!(.*?)\](?:\n(.*))?/;
		const matches = alertHead.innerHTML.match(regex);

		const matchType = matches[1].toLowerCase();
		alert.innerHTML = `<p>${alerts[matchType]}${alertTypes[matchType].toUpperCase()}</p>`;

		const paragraphElement = document.createElement('p');
		paragraphElement.innerHTML = matches[2]?.trim().replace(/<\/p>(?!.*<\/p>)/, '') ?? '';

		const bodyElement = document.createElement('div');
		bodyElement.appendChild(paragraphElement);

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
		const id = shownElement.id.slice(-1);
		document.getElementsByClassName('selected-header')[0]?.classList.remove('selected-header');

		selectedHeader = document.getElementById(`header-nav-${id}`);
		selectedHeader?.classList.add('selected-header');
	}
}

window.onscrollend = function () {
	selectedHeader?.scrollIntoView({ behavior: 'smooth' });
	selectedHeader = null;

	if (!window.onscroll) {
		window.onscroll = onScroll;
	}
}

