// Генерация навигации по заголовкам
const slugify = (function () {
	const translate_re = /[абвгдеёжзийклмнопрстуфхцчшщъыьэюя]/g; // etc.
	// noinspection NonAsciiCharacters
	const translate = {
		"а": "a",
		"б": "b",
		"в": "v",
		"г": "g",
		"д": "d",
		"е": "e",
		"ё": "yo",
		"ж": "zh",
		"з": "z",
		"и": "i",
		"к": "k",
		"л": "l",
		"м": "m",
		"н": "n",
		"о": "o",
		"п": "p",
		"р": "r",
		"с": "s",
		"т": "t",
		"у": "u",
		"ф": "f",
		"х": "h",
		"ц": "c",
		"ч": "ch",
		"ш": "sh",
		"щ": "sch",
		"ъ": "",
		"ы": "y",
		"ь": "",
		"э": "e",
		"ю": "yu",
		"я": "ya"
	};
	return function (s) {
		return (s.toLowerCase().replace(translate_re, function (match) {
			return translate[match];
		})).replaceAll(',', '').replaceAll(' ', '-').replaceAll(' ', '-');
	}
})();
const headers = document.querySelectorAll('.page__content h2');
if (headers.length) {
	const callback = function (entries) {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				document.querySelectorAll('.page__aside_navigation a').forEach((link) => link.ariaCurrent = "false");
				document.querySelector('a[href="#' + entries[0].target.id + '"]').ariaCurrent = "true";
			}
		});
	};
	const observer = new IntersectionObserver(callback, {
		threshold: 1.0
	});
	const headersList = document.createElement('ul');
	headersList.classList.add('page__aside_navigation');
	headersList.hidden = true;
	for (let header of headers) {
		const linkText = header.textContent.split('.')[0];
		const linkTextSlug = slugify(linkText);
		header.id = linkTextSlug;
		let headersListItem = document.createElement('li');
		let anchor = document.createElement('a');
		anchor.href = '#' + linkTextSlug;
		anchor.textContent = linkText;
		anchor.addEventListener('click', function (e) {
			e.preventDefault();
			header.scrollIntoView({block: "center", behavior: "smooth"});
		})
		headersListItem.appendChild(anchor);
		headersList.appendChild(headersListItem);
		observer.observe(header);
	}
	document.querySelector('.page__aside').appendChild(headersList);
}
